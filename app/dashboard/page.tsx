"use client"

import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import Image from 'next/image';
import Link from "next/link";
import { Calendar, FileText, UploadCloud } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface FileType {
  _id: string;
  _creationTime: number;
  fileId: string;
  storageId: string;
  fileName: string;
  fileUrl: string;
  createdBy: string;
}

function Dashboard() {
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const files = useQuery(api.fileStorage.GetUderFiles, {
    userEmail: user?.primaryEmailAddress?.emailAddress
  }) as FileType[] | undefined;

  // Format date function
  const formatDate = (timestamp: number) => {
    if (!timestamp) return "Unknown date";
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    });
  };

  // Handle file click
  const handleFileClick = (fileId: string, fileUrl: string, e: React.MouseEvent) => {
    e.preventDefault();
    console.log("Navigating to file:", fileId, "URL:", fileUrl); // Debug log
    
    if (fileId) {
      // Store the fileUrl in sessionStorage for immediate access in workspace
      if (fileUrl) {
        sessionStorage.setItem(`pdf_${fileId}`, fileUrl);
      }
      
      router.push(`/workspace/${fileId}`);
    }
  };

  // Calculate shimmer effect for skeleton loaders
  const shimmer = `
    relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full 
    before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent 
    before:via-white/60 before:to-transparent
  `;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="relative mb-6 sm:mb-8">
          <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl text-slate-800 relative inline-block">
            <span className="relative z-10">Your Workspace</span>
            <span className="absolute bottom-0 left-0 w-16 h-2 bg-indigo-400 rounded-full z-0"></span>
          </h2>
          
          {mounted && (
            <div className="ml-2 inline-block transition-opacity duration-700 opacity-100">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {files ? `${files.length} files` : "Loading..."}
              </span>
            </div>
          )}
        </div>

        {/* Loading skeleton or actual content */}
        {!files ? (
          // Skeleton Loading State
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 md:gap-6">
            {[...Array(8)].map((_, index) => (
              <div 
                key={`skeleton-${index}`} 
                className={`bg-white rounded-lg overflow-hidden shadow-md 
                  border border-slate-100 min-h-[220px] ${shimmer}`}
              >
                {/* Skeleton header */}
                <div className="bg-slate-200 p-4 relative h-20">
                  <div className="absolute -bottom-8 left-4 p-2 bg-slate-100 rounded-lg w-[60px] h-[60px]"></div>
                </div>
                
                {/* Skeleton content */}
                <div className="p-4 pt-10">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2 mb-6"></div>
                  
                  {/* Skeleton metadata */}
                  <div className="mt-auto pt-2">
                    <div className="flex items-center mb-2">
                      <div className="h-3 w-3 bg-slate-200 rounded mr-2"></div>
                      <div className="h-3 bg-slate-200 rounded w-24"></div>
                    </div>
                    <div className="flex items-center">
                      <div className="h-3 w-3 bg-slate-200 rounded mr-2"></div>
                      <div className="h-3 bg-slate-200 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : files.length > 0 ? (
          // Actual content when files are available
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 md:gap-6">
            {files.map((file, index) => (
              <div 
                key={index} 
                onClick={(e) => handleFileClick(file.fileId, file.fileUrl, e)}
                className="cursor-pointer block w-full"
              >
                <div 
                  className={`flex flex-col h-full bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl 
                  border border-slate-100 hover:border-indigo-200 transition-all duration-300 
                  hover:translate-y-[-4px] group min-h-[220px] ${mounted ? 'animate-fadeIn' : ''}`}
                  style={{
                    animationDelay: `${index * 0.05}s`
                  }}
                >
                  {/* Header with gradient background */}
                  <div className="bg-gradient-to-r from-indigo-500/90 to-purple-500/90 p-4 relative h-20">
                    <div className="absolute -bottom-8 left-4 p-2 bg-white rounded-lg shadow-md border border-slate-100 group-hover:border-indigo-200 transition-all">
                      <div className="relative w-14 h-14">
                        <Image 
                          src={'/pdf.png'} 
                          alt="file" 
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 p-4 pt-10">
                    <h2 className="font-medium text-base text-gray-800 line-clamp-2 break-words mb-2 group-hover:text-indigo-600 transition-colors">
                      {file.fileName}
                    </h2>
                    
                    {/* File metadata */}
                    <div className="mt-auto pt-2">
                      <div className="flex items-center text-xs text-slate-500 mb-1.5">
                        <Calendar className="w-3 h-3 mr-1.5" />
                        <span>{formatDate(file._creationTime)}</span>
                      </div>
                      <div className="flex items-center text-xs text-slate-500">
                        <FileText className="w-3 h-3 mr-1.5" />
                        <span className="truncate">PDF Document</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action indicator */}
                  <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Empty state
          <div className="col-span-1 xs:col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-5 flex flex-col items-center justify-center p-10 bg-white rounded-lg shadow-sm border border-slate-100 animate-fadeIn">
            <div className="w-24 h-24 mb-4 bg-indigo-50 rounded-full flex items-center justify-center">
              <UploadCloud className="w-12 h-12 text-indigo-400" />
            </div>
            <h3 className="text-xl font-medium text-slate-800 mb-2">No PDF files yet</h3>
            <p className="text-center text-slate-500 mb-6 max-w-md">
              Upload your first PDF document to get started. Your documents will appear here for easy access.
            </p>
            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-4 rounded-lg border border-indigo-100">
              <p className="text-sm text-indigo-700">
                <span className="font-medium">Tip:</span> You can upload PDF files using the upload button in the sidebar.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard;