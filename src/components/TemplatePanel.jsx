import React, { useState } from 'react'
import MappingControls from './MappingControls'

export default function TemplatePanel({
  templateBuffer,
  setTemplateBuffer,
  headers,
  mapping,
  setMapping,
  eventName, // 🆕
  setEventName, // 🆕
}) {
  const [fileName, setFileName] = useState(null)

  const handleTemplate = async (e) => {
    const f = e.target.files[0]
    if (!f) return
    const buffer = await f.arrayBuffer()
    setTemplateBuffer(buffer)
    setFileName(f.name)
    e.target.value = ''
  }

  const removeTemplate = () => {
    setTemplateBuffer(null)
    setFileName(null)
  }

  return (
    <>
      <strong>2- Template Word</strong>
      <div style={{ height: '8px' }}></div>

      <label className="drop">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 600 }}>Carregar modelo (.docx)</div>
            <div className="small">
              Use placeholders como <code>#nome</code>, <code>#evento</code>
            </div>
          </div>
          <button
            className="secondary"
            type="button"
            onClick={() => document.getElementById('wordInput').click()}
          >
            Selecionar .docx
          </button>
        </div>
        <input
          id="wordInput"
          type="file"
          accept=".docx"
          onChange={handleTemplate}
          style={{ display: 'none' }}
        />
      </label>

      {fileName && (
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="small" title={fileName}>
            Arquivo selecionado: <strong>{fileName}</strong>
          </div>
          <button className="secondary" onClick={() => document.getElementById('wordInput').click()}>
            Substituir
          </button>
          <button className="danger" onClick={removeTemplate}>
            Remover
          </button>
        </div>
      )}

      {/* 🆕 Campo de Nome do Evento */}
      {templateBuffer && (
        <div style={{ marginTop: 15 }}>
          <label>
            <div className="small" style={{ fontWeight: 600 }}>
              Nome do Evento:
            </div>
            <input
              type="text"
              placeholder="Ex: Conferência 2025"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              style={{ width: '100%', padding: '6px 8px', marginTop: 5 }}
            />
          </label>
        </div>
      )}

      {templateBuffer && (
        <MappingControls headers={headers} mapping={mapping} setMapping={setMapping} />
      )}
    </>
  )
}
