"use client"

import { FileText, RefreshCcw } from "lucide-react"
import { useState } from "react"

interface PdfViewerProps {
  fileUrl: string | null | undefined;
  onRetry?: () => void;
}

function PdfViewer({ fileUrl, onRetry }: PdfViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Check if the URL is valid
  const isValidUrl = fileUrl && fileUrl.trim() !== "";
  
  const handleLoad = () => {
    setIsLoading(false);
    setError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-sm font-medium text-gray-700">PDF Viewer</h2>
      </div>
      
      <div className="flex-1 relative">
        {isValidUrl ? (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            )}
            <iframe
              src={fileUrl}
              className="w-full h-full border-0 rounded-b-lg"
              title="PDF Viewer"
              onLoad={handleLoad}
              onError={handleError}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Cannot display PDF</h3>
            <p className="text-sm text-gray-500 text-center mb-6">No valid URL was provided</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors flex items-center gap-2"
              >
                <RefreshCcw className="w-4 h-4" />
                <span>Retry Loading</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PdfViewer;