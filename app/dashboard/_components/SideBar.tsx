"use client"

import { Button } from "@/components/ui/button"
import { Layout, Shield, X } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import UploadPdfDialogue from "./UploadPdfDialogue"
import { useUser } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { usePathname } from "next/navigation"
import Link from "next/link"

function SideBar() {
  const {user} = useUser();
  const path = usePathname();

  const fileList = useQuery(api.fileStorage.GetUderFiles, {
    userEmail: user?.primaryEmailAddress?.emailAddress
  });

  return (
    <div className="h-screen p-4 sm:p-6 md:p-7 flex flex-col overflow-y-auto">
      {/* Close button for mobile */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden absolute top-4 right-4 z-10"
        onClick={() => {
          const event = new CustomEvent('closeSidebar');
          window.dispatchEvent(event);
        }}
      >
        <X className="h-5 w-5" />
      </Button>

      {/* Main content */}
      <div className="mt-10 md:mt-0 flex flex-col flex-1">
        <div className="mb-6">
          <UploadPdfDialogue isMaxFile={(fileList?.length ?? 0) >= 5} />
        </div>

        <div className="space-y-1">
          <Link href={"/dashboard"}>
            <div className={`
              flex gap-2 items-center p-3
              hover:bg-slate-100 rounded-lg cursor-pointer transition-colors
              ${path === "/dashboard" ? "bg-slate-200" : ""}
            `}>
              <Layout className="h-5 w-5" />
              <h2 className="text-sm sm:text-base">Workspace</h2>
            </div>
          </Link>
          
          <Link href={"/dashboard/upgrade"}>
            <div className={`
              flex gap-2 items-center p-3
              hover:bg-slate-100 rounded-lg cursor-pointer transition-colors
              ${path === "/dashboard/upgrade" ? "bg-slate-200" : ""}
            `}>
              <Shield className="h-5 w-5" />
              <h2 className="text-sm sm:text-base">Upgrade</h2>
            </div>
          </Link>
        </div>
      </div>

      {/* Progress section */}
      <div className="mt-auto pt-6 pb-8 px-2 border-t">
        <Progress value={((fileList?.length ?? 0) / 5) * 100} className="h-2" />
        <p className="text-xs sm:text-sm mt-2">
          {fileList?.length ?? 0} out of 5 PDFs Uploaded
        </p>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Upgrade to upload more PDFs
        </p>
      </div>
    </div>
  )
}

export default SideBar