"use client"

import { FileText } from "lucide-react"

export default function PdfEmptyState() {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center text-center bg-gray-50">
      <div className="p-4 rounded-full bg-indigo-100 mb-4">
        <FileText className="w-8 h-8 text-indigo-600" />
      </div>
      
      <h3 className="text-xl font-medium text-gray-800 mb-2">
        No PDF documents yet
      </h3>
      
      <p className="text-gray-600 max-w-md mb-6">
        Upload your first PDF document and start chatting with it.
        You can upload research papers, books, articles, or any other PDF documents.
      </p>
      
      <div className="flex flex-col gap-2 items-center text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 text-xs font-medium">
            1
          </div>
          <span>Click on the &quot;Upload PDF File&quot; button above</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 text-xs font-medium">
            2
          </div>
          <span>Select your PDF file</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 text-xs font-medium">
            3
          </div>
          <span>Wait for the upload and processing to complete</span>
        </div>
      </div>
    </div>
  )
}