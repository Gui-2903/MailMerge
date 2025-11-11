function PdfPreview({ url }) {
  return (
    <div style={{ width: "100%", height: "90vh", border: "1px solid #ccc" }}>
      <iframe
        src={url}
        title="PDF Preview"
        style={{ width: "100%", height: "100%", border: "none" }}
      ></iframe>
    </div>
  );
}

export default PdfPreview;
