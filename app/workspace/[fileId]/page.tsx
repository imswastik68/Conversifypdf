"use client"

import { useParams } from "next/navigation";
import WorkspaceHeader from "../_components/WorkspaceHeader";
import PdfViewer from "../_components/PdfViewer";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import TextEditor from "../_components/TextEditor";

function Workspace() {

    const {fileId} = useParams();
    const fileInfo = useQuery(api.fileStorage.GetFileRecord, {
      fileId: Array.isArray(fileId) ? fileId[0] : fileId || ""
    })


  return (
    <div>
      <WorkspaceHeader fileName = {fileInfo?.fileName} />

      <div className="grid grid-cols-2 gap-5">
        <div>
            {/* PDF Viewer */}
            <PdfViewer fileUrl={fileInfo?.fileUrl} />
        </div>

        <div>
            {/* Text Editor */}
            <TextEditor fileId={fileId} />
        </div>
      </div>
    </div>
  )
}

export default Workspace