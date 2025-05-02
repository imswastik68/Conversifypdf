
function PdfViewer({fileUrl}: {fileUrl: string}) {
  return (
    <div>
        <iframe src={fileUrl + "#toolbar=0"} width="100%" height="90vh" className="h-[90vh]" />
    </div>
  )
}

export default PdfViewer