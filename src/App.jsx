import React, { useState } from 'react'
import Header from './components/Header'
import SheetPanel from './components/SheetPanel'
import TemplatePanel from './components/TemplatePanel'
import MappingControls from './components/MappingControls'
import PreviewPanel from './components/PreviewPanel'
import Footer from './components/Footer'

export default function App() {
  const [excelData, setExcelData] = useState([])
  const [headers, setHeaders] = useState([])
  const [templateBuffer, setTemplateBuffer] = useState(null)
  const [mapping, setMapping] = useState({})
  const [selectedRow, setSelectedRow] = useState(null)
  const [previewBlob, setPreviewBlob] = useState(null)
  const [eventName, setEventName] = useState('') // 🆕 novo estado

  return (
    <div className="app">
      <Header />
      <div className="grid">
        <div className="panel">
          <SheetPanel
            excelData={excelData}
            setExcelData={setExcelData}
            setHeaders={setHeaders}
            headers={headers}
            selectedRow={selectedRow}
            setSelectedRow={setSelectedRow}
          />
          <TemplatePanel
            templateBuffer={templateBuffer}
            setTemplateBuffer={setTemplateBuffer}
            headers={headers}
            mapping={mapping}
            setMapping={setMapping}
            eventName={eventName} // 🆕
            setEventName={setEventName} // 🆕
          />
        </div>

        <div className="panel preview-area">
          <PreviewPanel
            excelData={excelData}
            headers={headers}
            mapping={mapping}
            selectedRow={selectedRow}
            templateBuffer={templateBuffer}
            previewBlob={previewBlob}
            setPreviewBlob={setPreviewBlob}
            eventName={eventName} // 🆕
          />
        </div>
      </div>
      <Footer />
    </div>
  )
}
