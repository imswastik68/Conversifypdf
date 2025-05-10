"use client"

import { useState } from "react"
import { FileText, MoreVertical, MessageSquare, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface FileType {
  _id: string;
  _creationTime: number;
  fileId: string;
  storageId: string;
  fileName: string;
  fileUrl: string;
  createdBy: string;
}

export default function PdfFileList({ files }: { files: FileType[] }) {
  const router = useRouter()
  const [fileToDelete, setFileToDelete] = useState<string | null>(null)
  const deleteFile = useMutation(api.fileStorage.fixFileRecord)
  
  const handleChat = (fileId: string) => {
    router.push(`/chat/${fileId}`)
  }
  
  const handleDelete = async (fileId: string) => {
    try {
      await deleteFile({ fileId })
      router.refresh()
    } catch (error) {
      console.error("Error deleting file:", error)
    }
  }
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file) => (
          <div 
            key={file._id} 
            className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-indigo-100">
                  <FileText className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="font-medium text-gray-800 truncate" title={file.fileName}>
                  {file.fileName}
                </h3>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => handleChat(file._id)}
                    className="cursor-pointer"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Chat
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setFileToDelete(file._id)}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="mt-3 text-sm text-gray-500">
              {file._creationTime && (
                <p>
                  Added {formatDistanceToNow(new Date(file._creationTime), { addSuffix: true })}
                </p>
              )}
            </div>
            
            <div className="mt-4 flex justify-between">
              <Button
                variant="outline"
                size="sm"
                className="text-gray-600 border-gray-300 hover:bg-gray-50"
                onClick={() => window.open(file.fileUrl, "_blank")}
              >
                View PDF
              </Button>
              
              <Button
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => handleChat(file._id)}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      <AlertDialog open={!!fileToDelete} onOpenChange={(open) => !open && setFileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the PDF document.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleDelete(fileToDelete as string)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}