import React from 'react'

export default function Header() {
  return (
    <header>
      <div>
        <h1>MailMerge — Planilha + Modelo Word</h1>
        <p className="lead">
          Carregue uma planilha, escolha um template .docx com placeholders (ex:
          <code> #nome </code>) e gere/preview dos documentos.
        </p>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div className="small">
          Dica: primeiro carregue a planilha, depois o template Word.
        </div>
      </div>
    </header>
  )
}
