"use client"

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import TextEditor from "../_components/TextEditor";
import WorkspaceHeader from "../_components/WorkspaceHeader";
import PdfViewer from "../_components/PdfViewer";

function Workspace() {
  const params = useParams();
  const fileId = Array.isArray(params.fileId) ? params.fileId[0] : params.fileId;

  // Get mutations
  const getFileUrl = useMutation(api.fileStorage.getFileUrl);
  const addFileEntry = useMutation(api.fileStorage.addFileEntryToDb);

  // Get file check
  const fileCheck = useQuery(api.fileStorage.CheckFileExists, 
    fileId ? { fileId } : "skip"
  ) as { exists: boolean; message: string; storageId: string | null; fileUrl: string | null; fileName?: string } | undefined;

  // Get file record
  const fileInfo = useQuery(api.fileStorage.GetFileRecord, 
    fileId ? { fileId } : "skip"
  ) as { fileId: string; storageId: string; fileName: string; fileUrl: string; createdBy: string } | undefined;

  // Determine which URL to use
  const fileUrl = fileCheck?.fileUrl || fileInfo?.fileUrl;

  // If we have a file but no URL, try to get it from storage
  useEffect(() => {
    const fetchFileUrl = async () => {
      if (fileInfo?.storageId && !fileUrl) {
        try {
          const url = await getFileUrl({ storageId: fileInfo.storageId });
          if (url && fileInfo) {
            await addFileEntry({
              fileId: fileInfo.fileId,
              storageId: fileInfo.storageId,
              fileName: fileInfo.fileName,
              fileUrl: url,
              createdBy: fileInfo.createdBy
            });
          }
        } catch (error) {
          console.error("Error fetching file URL:", error);
        }
      }
    };

    fetchFileUrl();
  }, [fileInfo, fileUrl, getFileUrl, addFileEntry]);

  return (
    <div className="min-h-screen bg-gray-50">
      <WorkspaceHeader fileName={fileInfo?.fileName || fileCheck?.fileName || "Untitled Document"} />
      
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* PDF Viewer */}
          <div className="h-[calc(100vh-12rem)]">
            <PdfViewer 
              fileUrl={fileUrl} 
              onRetry={() => {}} // Optional: stubbed out if needed by PdfViewer props
            />
          </div>

          {/* Text Editor */}
          <div className="h-[calc(100vh-12rem)]">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 h-full flex flex-col">
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-sm font-medium text-gray-700">Notes Editor</h2>
              </div>
              <div className="flex-1 overflow-hidden">
                <TextEditor fileId={fileId || ""} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Workspace;
