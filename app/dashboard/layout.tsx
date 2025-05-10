"use client"

import { ReactNode, useState, useEffect } from "react"
import SideBar from "./_components/SideBar"
import Header from "./_components/Header"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

function DashboardLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleCloseSidebar = () => setIsSidebarOpen(false);
    window.addEventListener('closeSidebar', handleCloseSidebar);
    return () => window.removeEventListener('closeSidebar', handleCloseSidebar);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Full Width */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
        <Header />
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-[64px] left-0 right-0 z-40 bg-white border-b">
        <div className="flex items-center p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed top-[112px] md:top-[64px] left-0 h-[calc(100vh-112px)] md:h-[calc(100vh-64px)] w-64 bg-white border-r transform transition-transform duration-300 ease-in-out z-30
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
        shadow-lg md:shadow-none
      `}>
        <SideBar />
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="pt-[112px] md:pt-[64px] md:ml-64 min-h-screen">
        <main className="p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout