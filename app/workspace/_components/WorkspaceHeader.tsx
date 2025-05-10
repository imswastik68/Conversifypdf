import { UserButton } from "@clerk/nextjs"
import Image from "next/image"
import { FileText } from "lucide-react"

function WorkspaceHeader({ fileName }: { fileName: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between border-b border-gray-100">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
          <FileText className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{fileName}</h1>
          <p className="text-sm text-gray-500">Working on document</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </div>
  )
}

export default WorkspaceHeader