import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";


const Navbar = () => {

    return(
        <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm z-50 border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                    <BookOpen className="h-8 w-8" />
                    <span className="ml-2 text-xl font-bold">ConversifyPDF</span>
                </div>
                <div className="hidden md:flex items-center space-x-8">
                    <Link href="#features" className="text-gray-600 hover:text-gray-900">Features</Link>
                    <Link href="#solution" className="text-gray-600 hover:text-gray-900">Solution</Link>
                    <Link href="#testimonials" className="text-gray-600 hover:text-gray-900">Testimonials</Link>
                    <Button>Get Started</Button>
                </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar;