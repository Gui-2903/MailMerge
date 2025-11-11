import React from 'react'
import * as XLSX from 'xlsx'

export default function SheetPanel({ excelData, setExcelData, setHeaders, headers, selectedRow, setSelectedRow }) {
  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const data = await file.arrayBuffer()
    const workbook = XLSX.read(data, { type: 'array' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })
    const headerRow = rows[0]
    setHeaders(headerRow)
    setExcelData(rows.slice(1))
  }

  return (
    <>
      <strong>1) Upload & Visualização de dados</strong>
      <div style={{ height: '8px' }}></div>

      <label className="drop">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 600 }}>Arraste ou selecione a planilha</div>
            <div className="small">.xlsx, .xls ou .csv</div>
          </div>
          <button
            className="btn"
            onClick={() => document.getElementById('sheetInput').click()}
            type="button"
          >
            Selecionar
          </button>
        </div>
        <input
          id="sheetInput"
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFile}
          style={{ display: 'none' }}
        />
      </label>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {excelData.map((row, rIdx) => (
              <tr
                key={rIdx}
                className={selectedRow === rIdx ? 'selected' : ''}
                onClick={() => setSelectedRow(rIdx)}
              >
                {row.map((cell, cIdx) => (
                  <td key={cIdx}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
