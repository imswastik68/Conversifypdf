"use client"

import { useEffect, useState } from "react"
import { FileText, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardLoadingSkeleton() {
  // Optional: Simulate progressive loading for better UX
  const [progress, setProgress] = useState(0)
  
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(timer)
          return 100
        }
        return prevProgress + 5
      })
    }, 150)
    
    return () => {
      clearInterval(timer)
    }
  }, [])
  
  return (
    <div className="w-full space-y-6 p-4 md:p-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
      
      {/* PDF loading indicator */}
      <div className="border rounded-lg p-6 bg-indigo-50 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-indigo-100 animate-pulse">
            <FileText className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
              <p className="text-sm text-indigo-700">Loading your PDF documents...</p>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-indigo-700 font-medium">Loading files</span>
            <span className="text-xs text-indigo-700 font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* PDF file skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gray-100">
                <FileText className="w-5 h-5 text-gray-400" />
              </div>
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DashboardLoadingSkeleton