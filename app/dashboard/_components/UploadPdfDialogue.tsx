"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2Icon, FileText, Upload, X, CheckCircle, AlertCircle } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

function UploadPdfDialogue({ isMaxFile }: { isMaxFile: boolean }) {
    const generateUploadUrl = useMutation(api.fileStorage.generateUploadUrl);
    const addFileEntry = useMutation(api.fileStorage.addFileEntryToDb);
    const getFileUrl = useMutation(api.fileStorage.getFileUrl);
    const embedddDocumnent = useAction(api.myActions.ingest);
    const { user } = useUser();
    
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [fileName, setFileName] = useState("");
    const [open, setOpen] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Clear the file input value when dialog is closed
    useEffect(() => {
        if (!open && fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }, [open]);

    const handleOpenChange = (newOpen: boolean) => {
        if (!loading) {
            setOpen(newOpen);
            if (!newOpen) {
                // Reset the form state when closing the dialog
                resetForm();
            }
        }
    };

    const resetForm = () => {
        setFile(null);
        setFileName("");
        setUploadProgress(0);
        setUploadStatus('idle');
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type === 'application/pdf') {
                setFile(selectedFile);
                // Set the filename from the file if user hasn't entered one
                if (!fileName) {
                    setFileName(selectedFile.name.replace(/\.pdf$/i, ''));
                }
                toast.success("PDF file selected");
            } else {
                toast.error("Please select a valid PDF file");
                resetForm();
            }
        }
    };

    // More efficient progress updates
    const updateProgress = (progress: number) => {
        setUploadProgress(progress);
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error("Please select a file first");
            return;
        }

        if (!fileName.trim()) {
            toast.error("Please enter a file name");
            return;
        }

        try {
            setLoading(true);
            setUploadStatus('uploading');
            
            // Start with initial progress
            updateProgress(5);
            
            // Step 1 & 2: Get upload URL and upload file - parallelize preparation
            const postUrlPromise = generateUploadUrl();
            
            // Prepare other data while waiting for URL
            const fileId = uuidv4();
            updateProgress(15);
            
            // Get the URL and upload
            const postUrl = await postUrlPromise;
            updateProgress(25);
            
            // Upload file with progress tracking if supported
            const xhr = new XMLHttpRequest();
            const uploadPromise = new Promise<{storageId: string}>((resolve, reject) => {
                xhr.open('POST', postUrl, true);
                if (file.type) {
                    xhr.setRequestHeader('Content-Type', file.type);
                }
                
                // Track upload progress
                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        // Map upload progress to 25-70% of total progress
                        const uploadPercentage = event.loaded / event.total;
                        updateProgress(25 + Math.floor(uploadPercentage * 45));
                    }
                };
                
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response);
                    } else {
                        reject(new Error('Upload failed with status: ' + xhr.status));
                    }
                };
                
                xhr.onerror = () => reject(new Error('Network error'));
                xhr.send(file);
            });
            
            const { storageId } = await uploadPromise;
            updateProgress(70);
            
            // Get file URL - start this immediately
            const fileUrlPromise = getFileUrl({ storageId: storageId });
            
            // Get the resolved URL
            const fileUrl = await fileUrlPromise;
            if (!fileUrl) {
                throw new Error("Failed to get file URL from storage");
            }
            updateProgress(80);
            
            // Update the file entry with the URL
            await addFileEntry({
                fileId: fileId,
                storageId: storageId,
                fileName: fileName,
                fileUrl: fileUrl,
                createdBy: user?.primaryEmailAddress?.emailAddress ?? ""
            });
            
            updateProgress(85);
            
            // Process PDF - show real progress
            setUploadStatus('processing');
            
            // Make API call to fetch pdf process data - optimize with timeout protection
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout
            
            const ApiResp = await fetch("/api/pdf-loader?pdfUrl=" + fileUrl, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            if (!ApiResp.ok) {
                throw new Error("Failed to process PDF");
            }
            
            updateProgress(90);
            const ApiRespJson = await ApiResp.json();
            
            // Embed document
            await embedddDocumnent({
                slitText: ApiRespJson.result,
                fileId: fileId
            });

            updateProgress(100);
            setUploadStatus('success');
            toast.success("File uploaded and processed successfully!");
            
            // Close dialog after success - shorter delay
            setTimeout(() => {
                setOpen(false);
                resetForm();
            }, 800);
            
        } catch (error) {
            console.error("Upload error:", error);
            setUploadStatus('error');
            toast.error("Error uploading file. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleBrowseClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (fileInputRef.current && !loading) {
            fileInputRef.current.click();
        }
    };

    const handleRemoveFile = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        resetForm();
    };

    // Handle drag events separately to prevent reopening file browser
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (loading) return;
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type === 'application/pdf') {
                setFile(droppedFile);
                if (!fileName) {
                    setFileName(droppedFile.name.replace(/\.pdf$/i, ''));
                }
                toast.success("PDF file selected");
            } else {
                toast.error("Please select a valid PDF file");
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button 
                    onClick={() => setOpen(true)} 
                    disabled={isMaxFile} 
                    className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all"
                >
                    <Upload className="w-4 h-4 mr-2" /> Upload PDF File
                </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-md md:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2 text-indigo-800">
                        <FileText className="w-5 h-5" />
                        Upload PDF Document
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                        Add a PDF file to your collection
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                    {/* File Upload Area */}
                    <div 
                        className={`
                            border-2 border-dashed rounded-lg p-8 
                            ${file ? 'border-green-400 bg-green-50' : 'border-indigo-300 bg-indigo-50'} 
                            transition-all duration-300 ease-in-out
                            ${loading ? 'opacity-70' : 'hover:border-indigo-500 hover:bg-indigo-100'}
                        `}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="application/pdf"
                            onChange={handleFileSelect}
                            className="hidden"
                            disabled={loading}
                        />
                        
                        {!file ? (
                            <div className="flex flex-col items-center justify-center text-center gap-3">
                                <div className="p-4 rounded-full bg-indigo-100">
                                    <Upload className="w-8 h-8 text-indigo-600" />
                                </div>
                                <p className="text-lg font-medium text-indigo-800">Drag & drop your PDF here</p>
                                <p className="text-sm text-gray-600">or</p>
                                <Button 
                                    variant="secondary" 
                                    onClick={handleBrowseClick}
                                    disabled={loading}
                                    className="mt-2 bg-white hover:bg-gray-100"
                                >
                                    Browse Files
                                </Button>
                                <p className="text-xs text-gray-500 mt-2">
                                    Maximum file size: 10MB
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3">
                                <div className="p-3 rounded-full bg-green-100">
                                    <FileText className="w-8 h-8 text-green-600" />
                                </div>
                                <p className="text-base font-medium text-green-700 truncate max-w-full">
                                    {file.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                                {!loading && (
                                    <Button 
                                        variant="destructive" 
                                        size="sm" 
                                        onClick={handleRemoveFile}
                                        className="mt-1"
                                    >
                                        <X className="w-4 h-4 mr-1" />
                                        Remove
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* File Name Input */}
                    {file && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                File Name
                            </label>
                            <Input 
                                placeholder="Enter a name for your file" 
                                value={fileName}
                                onChange={(e) => setFileName(e.target.value)}
                                disabled={loading}
                                className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    )}
                    
                    {/* Progress Bar */}
                    {loading && (
                        <div className="mt-6">
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium text-indigo-700">
                                    {uploadStatus === 'uploading' ? 'Uploading...' : 'Processing...'}
                                </p>
                                <p className="text-sm font-medium text-indigo-700">
                                    {uploadProgress.toFixed(0)}%
                                </p>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                    
                    {/* Status Messages */}
                    {uploadStatus === 'success' && (
                        <div className="mt-4 flex items-center text-green-600 gap-2 bg-green-50 p-3 rounded-md">
                            <CheckCircle className="w-5 h-5" />
                            <p>Upload successful!</p>
                        </div>
                    )}
                    
                    {uploadStatus === 'error' && (
                        <div className="mt-4 flex items-center text-red-600 gap-2 bg-red-50 p-3 rounded-md">
                            <AlertCircle className="w-5 h-5" />
                            <p>Upload failed. Please try again.</p>
                        </div>
                    )}
                </div>
                
                <DialogFooter className="flex justify-between sm:justify-between gap-2 mt-6">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => handleOpenChange(false)}
                        disabled={loading}
                        className="border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                        Cancel
                    </Button>
                    
                    <Button
                        onClick={handleUpload} 
                        disabled={loading || !file || !fileName.trim()}
                        className={`
                            min-w-24 transition-all duration-300
                            ${!loading && file && fileName.trim() 
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
                        `}
                    >
                        {loading ? (
                            <span className="flex items-center">
                                <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                                {uploadStatus === 'uploading' ? 'Uploading...' : 'Processing...'}
                            </span>
                        ) : (
                            <span className="flex items-center">
                                <Upload className="w-4 h-4 mr-2" />
                                Upload
                            </span>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>    
        </Dialog>
    );
}

export default UploadPdfDialogue;