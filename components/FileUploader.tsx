
'use client';

import { useDropzone } from 'react-dropzone';
import { useCallback, useState, useEffect, useRef } from 'react';
import {
    CircleArrowDown,
    RocketIcon,
    FileText,
    X,
    ArrowLeft,
    ArrowRight,
    Upload,
    CheckCircle2
} from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

function FileUploader() {
    const router = useRouter();
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);
    const uploadStartTimeRef = useRef(null);

    // Reset progress when file is removed
    useEffect(() => {
        if (!uploadedFile) {
            setUploadProgress(0);
        }
    }, [uploadedFile]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            if (file.type === 'application/pdf') {
                setUploadedFile(file as any); // Type assertion to fix type error
                toast.success("File uploaded successfully!");
            } else {
                toast.error("Please upload a PDF file only");
            }
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive, isFocused, isDragAccept, open } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf']
        },
        maxFiles: 1,
        disabled: isProcessing,
        noClick: true, // Disable click on the whole area
        noKeyboard: false
    });

    const handleBrowseClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isProcessing) {
            open();
        }
    };

    const removeFile = (e: React.MouseEvent | undefined) => {
        if (e) e.stopPropagation();
        setUploadedFile(null);
        if (fileInputRef.current) {
            (fileInputRef.current as HTMLInputElement).value = "";
        }
        toast.info("File removed");
    };

    const handleBack = () => {
        router.push('/dashboard');
    };
    const handleCancel = () => {
        removeFile(undefined);
        toast.info("Upload cancelled");
    };
    // Function to efficiently update progress
    const updateProgress = (value: number) => {
        // Reduce UI updates by throttling the progress
        requestAnimationFrame(() => {
            setUploadProgress(value);
        });
    };
    // Mock upload function with faster processing time
    const mockProcessFile = async (file: File) => {
        // For large files, create a simulated "chunk" upload
        const fileSize = file.size;
        const chunkSize = Math.min(fileSize, 1024 * 1024); // 1MB chunks or entire file if smaller
        let uploaded = 0;
        
        // Calculate how much time has elapsed since start
        const now = Date.now();
        const elapsedMs = uploadStartTimeRef.current ? now - uploadStartTimeRef.current : 0;
        
        // Process chunks faster if already waited some time
        const timePerChunk = Math.max(10, 50 - Math.floor(elapsedMs / 100)); // Reduce wait time as elapsed time increases
        
        while (uploaded < fileSize) {
            // Update progress based on uploaded amount
            const progress = Math.min(100, Math.floor((uploaded / fileSize) * 100));
            updateProgress(progress);
            
            // Process next chunk
            uploaded = Math.min(fileSize, uploaded + chunkSize);
            
            // Faster processing - reduced delay
            if (uploaded < fileSize) {
                await new Promise(resolve => setTimeout(resolve, timePerChunk));
            }
        }
        
        // Ensure we hit 100% at the end
        updateProgress(100);
    };

    const handleNext = async () => {
        if (!uploadedFile) {
            toast.error("Please upload a PDF file first");
            return;
        }
        setIsProcessing(true);
        uploadStartTimeRef.current = null;
        
        try {
            // Process and upload file - optimized
            await mockProcessFile(uploadedFile);
            
            toast.success("File processed successfully!");
            
            // Navigate to the next step - no need for additional delay
            router.push('/dashboard/results');
        } catch (error) {
            console.error("Processing error:", error);
            toast.error("Error processing file");
        } finally {
            setIsProcessing(false);
        }
    };
    // Manual file input handler - optimized to handle files efficiently
    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (file.type === 'application/pdf') {
                // Use URL.createObjectURL for large files to avoid unnecessary data copying
                setUploadedFile(file as any); // Type assertion to fix type error
                toast.success("File uploaded successfully!");
            } else {
                toast.error("Please upload a PDF file only");
                if (fileInputRef.current) {
                    (fileInputRef.current as HTMLInputElement).value = "";
                }
            }
        }
    };

    // Animation classes for the drag area
    const dragAreaClasses = `
        p-6 sm:p-8 md:p-10 border-2 border-dashed 
        rounded-lg flex items-center justify-center
        transition-all duration-300 ease-in-out
        ${uploadedFile ? 'border-green-600 bg-green-50' : 'border-indigo-600'}
        ${isFocused || isDragAccept ? "bg-indigo-100 border-indigo-800 border-4" : "bg-white"}
        ${isDragActive ? "border-4 bg-indigo-200" : ""}
        ${isProcessing ? "opacity-80 cursor-not-allowed" : "hover:bg-indigo-50"}
        shadow-lg h-64 sm:h-72 md:h-80 lg:h-96 w-full
    `;

  return (
        <div className='flex flex-col gap-4 sm:gap-6 items-center max-w-7xl mx-auto p-4 sm:p-6'>
            <div className="flex justify-between w-full">
                <Button 
                    variant="outline" 
                    onClick={handleBack}
                    disabled={isProcessing}
                    className="hover:bg-gray-100 transition-colors text-xs sm:text-sm"
                    size="sm"
                >
                    <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">Back to Dashboard</span>
                    <span className="xs:hidden">Back</span>
                </Button>
                {uploadedFile && (
                    <Button 
                        variant="outline" 
                        onClick={handleCancel}
                        disabled={isProcessing}
                        className="text-red-500 hover:bg-red-50 hover:text-red-600 border-red-200 transition-colors text-xs sm:text-sm"
                        size="sm"
                    >
                        <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="hidden xs:inline">Cancel Upload</span>
                        <span className="xs:hidden">Cancel</span>
                    </Button>
                )}
            </div>

            <div className="w-full relative">
                {/* Main dropzone area */}
                <div 
                    {...getRootProps()}
                    className={dragAreaClasses}
                >
                    {/* Hidden file input for drag and drop */}
            <input {...getInputProps()} />
                    
                    {/* Separate manual file input for direct browsing */}
                    <input 
                        type="file"
                        ref={fileInputRef}
                        accept="application/pdf"
                        onChange={handleFileInputChange}
                        style={{ display: 'none' }}
                        disabled={isProcessing}
                    />
                    
                    <div className='flex flex-col items-center justify-center gap-3 sm:gap-4 max-w-md text-center px-2'>
                        {uploadedFile ? (
                            <div className="flex flex-col items-center gap-3 sm:gap-4 animate-fadeIn">
                                <div className="p-4 sm:p-6 bg-green-100 rounded-full">
                                    <FileText className="h-8 w-8 sm:h-12 sm:w-12 md:h-16 md:w-16 text-green-600" />
                                </div>
                                <p className="font-medium text-base sm:text-lg text-green-700 break-words max-w-full">
                                    {uploadedFile.name}
                                </p>
                                <p className="text-xs sm:text-sm text-green-600">
                                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                                
                                <Button 
                                    variant="destructive" 
                                    size="sm" 
                                    onClick={removeFile}
                                    disabled={isProcessing}
                                    className="mt-1 sm:mt-2 bg-red-500 hover:bg-red-600 transition-colors"
                                >
                                    <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                    Remove File
                                </Button>
                            </div>
                        ) : isDragActive ? (
                            <>
                                <RocketIcon className='h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 text-indigo-600 animate-bounce' />
                                <p className="text-lg sm:text-xl font-semibold text-indigo-800">Drop to Upload!</p>
                                <p className="text-sm text-indigo-600">Release to upload your PDF</p>
                            </>
                        ) : (
                            <>
                                <CircleArrowDown className='h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 text-indigo-600 animate-pulse' />
                                <p className="text-lg sm:text-xl font-semibold text-indigo-800">Upload PDF Document</p>
                                <p className="text-xs sm:text-sm text-indigo-600">Drag & drop your file here or click the button below</p>
                                <Button 
                                    onClick={handleBrowseClick}
                                    className="mt-3 sm:mt-4 bg-indigo-600 hover:bg-indigo-700 transition-colors"
                                    disabled={isProcessing}
                                    size="sm"
                                >
                                    <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                    Select PDF File
                                </Button>
                                <p className="text-xs text-gray-500 mt-1 sm:mt-2">Only PDF files are supported</p>
                            </>
                        )}
                    </div>
                </div>
                
                {/* Progress bar for processing - optimized with smoother transitions */}
                {isProcessing && (
                    <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 w-4/5 max-w-md">
                        <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2.5">
                            <div 
                                className="bg-indigo-600 h-1.5 sm:h-2.5 rounded-full transition-all duration-150"
                                style={{ width: `${uploadProgress}%` }}
                            ></div>
                        </div>
                        <p className="text-center mt-1 sm:mt-2 text-indigo-700 font-medium text-xs sm:text-sm">
                            Processing: {uploadProgress}%
                        </p>
                    </div>
                )}
            </div>

            <div className="flex justify-end w-full mt-2 sm:mt-4">
                <Button 
                    onClick={handleNext}
                    disabled={!uploadedFile || isProcessing}
                    className={`
                        px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 text-sm sm:text-base md:text-lg transition-all duration-300
                        ${uploadedFile && !isProcessing ? 'bg-indigo-600 hover:bg-indigo-700 shadow-lg' : 'bg-gray-400'}
                    `}
                >
                    {isProcessing ? (
                        <div className="flex items-center">
                            <span className="animate-pulse">Processing...</span>
                        </div>
                    ) : uploadedFile ? (
                        <div className="flex items-center">
                            <span>Process Document</span>
                            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-1 sm:ml-2" />
                        </div>
                    ) : (
                        <div className="flex items-center">
                            <span className="hidden sm:inline">Upload a file first</span>
                            <span className="sm:hidden">Upload first</span>
                        </div>
                    )}
                </Button>
            </div>
        
            {/* Completion status */}
            {uploadedFile && !isProcessing && (
                <div className="w-full flex justify-center mt-1 sm:mt-2">
                    <div className="flex items-center text-green-600 text-xs sm:text-sm">
                        <CheckCircle2 className="h-3 w-3 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                        <span>Ready to process</span>
        </div>
    </div>
            )}
            
            {/* Add CSS animations */}
            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out forwards;
                }
                
                @media (max-width: 640px) {
                    .xs\\:hidden {
                        display: none;
                    }
                    .xs\\:inline {
                        display: inline;
                    }
                }
                
                @media (min-width: 641px) {
                    .xs\\:hidden {
                        display: inline;
                    }
                    .xs\\:inline {
                        display: inline;
                    }
                }
            `}</style>
        </div>
    );
}

export default FileUploader;