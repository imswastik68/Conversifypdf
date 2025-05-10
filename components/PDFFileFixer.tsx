import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';

const PDFFileFixer = () => {
  const [fileId, setFileId] = useState('');
  const [checkResult, setCheckResult] = useState(null);
  const [fixResult, setFixResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFixing, setIsFixing] = useState(false);

  // Get the direct file check function
  const checkFile = useMutation(api.fileStorage.CheckFileExists);
  const fixFile = useMutation(api.fileStorage.fixFileRecord);

  const handleCheck = async () => {
    if (!fileId) return;
    
    setIsLoading(true);
    setCheckResult(null);
    setFixResult(null);
    
    try {
      const result = await checkFile({ fileId });
      setCheckResult(result);
    } catch (error) {
      setCheckResult({
        error: true,
        message: error.message || 'An error occurred while checking the file'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFix = async () => {
    if (!fileId) return;
    
    setIsFixing(true);
    setFixResult(null);
    
    try {
      const result = await fixFile({ fileId });
      setFixResult(result);
      
      // If fix was successful, refresh the file status
      if (result.success) {
        const updatedStatus = await checkFile({ fileId });
        setCheckResult(updatedStatus);
      }
    } catch (error) {
      setFixResult({
        success: false,
        message: error.message || 'An error occurred while fixing the file'
      });
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">PDF File Diagnostics & Repair Tool</h1>
      
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File ID
            </label>
            <input
              type="text"
              value={fileId}
              onChange={(e) => setFileId(e.target.value)}
              placeholder="Enter file ID to check"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleCheck}
            disabled={isLoading || !fileId}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? 'Checking...' : 'Check File'}
          </button>
        </div>
      </div>

      {checkResult && (
        <div className="mb-6 p-4 border rounded">
          <h2 className="text-lg font-semibold mb-2">File Status</h2>
          
          {checkResult.error ? (
            <div className="bg-red-100 border-l-4 border-red-500 p-4">
              <p className="text-red-700">{checkResult.message}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Exists</p>
                  <p>{checkResult.exists ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Message</p>
                  <p>{checkResult.message}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Storage ID</p>
                  <p>{checkResult.storageId || 'Not found'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">File URL</p>
                  <p>{checkResult.fileUrl ? 'Present' : 'Missing'}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-500 mb-1">Debug Information</p>
                <div className="bg-gray-100 p-2 rounded overflow-auto max-h-60">
                  <pre className="text-xs">{JSON.stringify(checkResult.debugInfo, null, 2)}</pre>
                </div>
              </div>

              {checkResult.exists && checkResult.storageId && !checkResult.fileUrl && (
                <div className="mt-4">
                  <button
                    onClick={handleFix}
                    disabled={isFixing}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {isFixing ? 'Fixing...' : 'Fix File Record'}
                  </button>
                  <p className="text-sm text-gray-500 mt-1">
                    This will attempt to generate a file URL from the storage ID and update the record.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {fixResult && (
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold mb-2">Fix Result</h2>
          <div className={`p-4 ${fixResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
            <p className={fixResult.success ? 'text-green-700' : 'text-red-700'}>
              {fixResult.message}
            </p>
          </div>
          
          {fixResult.fileRecord && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500 mb-1">Updated File Record</p>
              <div className="bg-gray-100 p-2 rounded overflow-auto max-h-60">
                <pre className="text-xs">{JSON.stringify(fixResult.fileRecord, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      )}

      {checkResult && checkResult.fileUrl && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">File Preview</h2>
          <iframe 
            src={checkResult.fileUrl} 
            className="w-full h-96 border" 
            title="PDF Preview"
          />
        </div>
      )}
    </div>
  );
};

export default PDFFileFixer;