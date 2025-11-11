import React, { useEffect, useRef, useState } from 'react'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'
import axios from 'axios'

export default function PreviewPanel({
  excelData,
  headers,
  mapping,
  selectedRow,
  templateBuffer,
  previewBlob,
  setPreviewBlob,
  eventName, // 🆕
}) {
  const previewRef = useRef()
  const [pdfUrl, setPdfUrl] = useState(null)
  const [pdfBlob, setPdfBlob] = useState(null) // 🆕 para armazenar PDF individual

  useEffect(() => {
    if (!templateBuffer || selectedRow == null) return
    generatePreview()
  }, [selectedRow, templateBuffer, mapping])

  const buildData = (row) => {
    const obj = {}
    Object.keys(mapping).forEach((ph) => {
      const key = ph.replace('#', '')
      const colIdx = parseInt(mapping[ph])
      obj[key] = row[colIdx] || ''
    })
    return obj
  }

  const generatePreview = async () => {
    if (!templateBuffer || selectedRow == null) return

    const data = buildData(excelData[selectedRow])
    const zip = new PizZip(templateBuffer)
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true })
    doc.setData(data)
    doc.render()

    const content = doc.getZip().generate({ type: 'arraybuffer' })
    const file = new File([content], 'preview.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post('http://localhost:4000/convert', formData, {
        responseType: 'blob', // 🆕 importante
      })
      const blob = response.data
      setPdfBlob(blob)
      setPdfUrl(URL.createObjectURL(blob))
    } catch (err) {
      console.error('Erro ao converter para PDF:', err)
    }
  }

  const downloadPDF = () => {
    if (!pdfBlob) return
    const nome = buildData(excelData[selectedRow])?.nome?.replace(/\s+/g, '_') || `documento_${selectedRow + 1}`
    const evento = eventName ? eventName.replace(/\s+/g, '_') : 'Evento'
    saveAs(pdfBlob, `${nome}_${evento}.pdf`)
  }

  const generateAllZip = async () => {
    if (!templateBuffer || !excelData.length) return
    const zipOut = new JSZip()

    for (let i = 0; i < excelData.length; i++) {
      const data = buildData(excelData[i])
      const zip = new PizZip(templateBuffer)
      const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true })
      doc.setData(data)
      doc.render()

      const content = doc.getZip().generate({ type: 'arraybuffer' })
      const file = new File([content], `document_${i}.docx`, {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })
      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await axios.post('http://localhost:4000/convert', formData, {
          responseType: 'blob',
        })
        const blobPDF = response.data
        const nome = data.nome?.replace(/\s+/g, '_') || `documento_${i + 1}`
        const evento = eventName ? eventName.replace(/\s+/g, '_') : 'Evento'
        zipOut.file(`${nome}_${evento}.pdf`, blobPDF)
      } catch (err) {
        console.error(`Erro ao converter linha ${i + 1}:`, err)
      }
    }

    const content = await zipOut.generateAsync({ type: 'blob' })
    saveAs(content, 'documentos_PDF.zip')
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <strong>Preview do documento</strong>
        <div className="small">Selecione uma linha para ver o preview</div>
      </div>

      <div className="preview-box">
        {pdfUrl ? (
          <iframe src={pdfUrl} title="PDF Preview" style={{ width: '100%', height: '70vh', border: 'none' }} />
        ) : (
          <div ref={previewRef} style={{ minHeight: 200, color: 'var(--muted)' }}>
            Nenhum preview gerado
          </div>
        )}
      </div>

      <div className="footer-actions">
        <button className="btn" onClick={downloadPDF} disabled={!pdfBlob}>
          Baixar PDF
        </button>
        <button className="secondary" onClick={generateAllZip} disabled={!excelData.length}>
          Gerar todos (.zip)
        </button>
      </div>
    </>
  )
}
