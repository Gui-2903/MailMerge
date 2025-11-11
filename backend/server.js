import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import path from "path";
import libre from "libreoffice-convert";
import { execFile } from 'child_process';

const app = express();
app.use(cors());

const upload = multer({ dest: "uploads/" });

app.post("/convert", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    console.log('Recebido /convert, req.file:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
    });

    const filePath = req.file.path;
    const fileName = req.file.originalname.split(".")[0];
    const outputPath = path.join("converted", `${fileName}.pdf`);

    // Criar pasta converted se não existir
    if (!fs.existsSync('converted')) {
      fs.mkdirSync('converted', { recursive: true });
    }

    // Validar arquivo
    if (!fs.existsSync(filePath)) {
      console.error('Arquivo enviado não foi encontrado em', filePath);
      return res.status(500).json({ error: 'Arquivo não encontrado no servidor' });
    }

    const stat = fs.statSync(filePath);
    if (stat.size === 0) {
      console.error('Arquivo vazio recebido');
      return res.status(400).json({ error: 'Arquivo vazio' });
    }
    console.log('Arquivo salvo no servidor, size:', stat.size);

    const docxBuffer = fs.readFileSync(filePath);
    // debug: checar assinatura (zip = PK..)
    try {
      const sig = docxBuffer.slice(0, 4).toString('binary')
      const sigHex = docxBuffer.slice(0, 4).toString('hex')
      console.log('Buffer signature (binary):', sig)
      console.log('Buffer signature (hex):', sigHex)
    } catch (e) {
      console.error('Erro ao ler assinatura do buffer:', e)
    }

    try {
      // Tentar converter usando libreoffice-convert (callback)
      console.log('Tentando converter com libreoffice-convert...');
      const pdfBuffer = await new Promise((resolve, reject) => {
        libre.convert(docxBuffer, '.pdf', undefined, (err, done) => {
          if (err) return reject(err)
          resolve(done)
        })
      })
      fs.writeFileSync(outputPath, pdfBuffer);
      console.log('Conversão bem sucedida! PDF salvo em:', outputPath);
      return res.json({ url: `http://localhost:4000/${outputPath}` });
    } catch (convertErr) {
      console.error("Erro ao converter via libreoffice-convert:", convertErr);

      // Fallback: tentar converter usando soffice diretamente
      try {
        const convertedDir = path.join(process.cwd(), 'converted');
        const soffice = process.platform === 'win32' ? 
          'C:\\Program Files\\LibreOffice\\program\\soffice.exe' : 'soffice';

        console.log('Tentando fallback com soffice:', soffice);
        
        const args = [
          '--headless',
          '--convert-to', 
          'pdf:writer_pdf_Export',
          '--outdir', 
          convertedDir,
          filePath
        ];

        const { stdout, stderr } = await new Promise((resolve, reject) => {
          execFile(soffice, args, (error, stdout, stderr) => {
            if (error) {
              reject({ error, stdout, stderr });
            } else {
              resolve({ stdout, stderr });
            }
          });
        });

        console.log('soffice stdout:', stdout);
        if (stderr) console.error('soffice stderr:', stderr);
        // soffice may name the output PDF using the input filename (which for uploads is a hash),
        // so check a few possible locations/names.
        const possiblePaths = []
        // original expected path based on originalname
        possiblePaths.push(outputPath)
        // path based on actual uploaded filename (basename of filePath)
        possiblePaths.push(path.join(convertedDir, `${path.basename(filePath)}.pdf`))
        // also consider any recently created PDF in the convertedDir
        try {
          const files = fs.readdirSync(convertedDir)
          const pdfs = files.filter(f => f.toLowerCase().endsWith('.pdf'))
          // sort by mtime desc
          pdfs.sort((a, b) => {
            const aa = fs.statSync(path.join(convertedDir, a)).mtimeMs
            const bb = fs.statSync(path.join(convertedDir, b)).mtimeMs
            return bb - aa
          })
          for (const p of pdfs) {
            possiblePaths.push(path.join(convertedDir, p))
          }
        } catch (e) {
          console.error('Erro ao listar converted dir:', e)
        }

        // find the first existing path
        const found = possiblePaths.find(p => fs.existsSync(p))
        if (found) {
          const pdfName = path.basename(found)
          const url = `http://localhost:4000/converted/${encodeURIComponent(pdfName)}`
          return res.json({ url })
        }

        throw new Error('PDF não foi gerado após conversão')
      } catch (fallbackErr) {
        console.error('Erro no fallback:', fallbackErr);
        return res.status(500).json({ 
          error: 'Erro ao converter documento', 
          details: {
            initial: convertErr.message,
            fallback: fallbackErr.stderr || fallbackErr.message
          }
        });
      }
    } finally {
      // Limpar arquivo temporário
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.error('Erro ao remover arquivo temporário:', e);
      }
    }
   
  } catch (err) {
    console.error("Erro:", err);
    res.status(500).json({ error: "Erro interno" });
  }
});

app.use("/converted", express.static(path.join(process.cwd(), "converted")));
// expor uploads para permitir baixar o .docx gerado e inspecionar localmente
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

app.listen(4000, () => console.log("✅ Backend rodando em http://localhost:4000"));
