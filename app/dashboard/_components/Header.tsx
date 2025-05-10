import { UserButton } from "@clerk/nextjs"
import { BookOpen } from "lucide-react"
import Link from "next/link"

function Header() {
  return (
    <div className="flex items-center justify-between p-4 h-16">
      <div className="flex items-center">
        <Link href="/" className="flex items-center">
          <BookOpen className="h-8 w-8" />
          <span className="ml-2 text-xl font-bold">ConversifyPDF</span>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  )
}

export default Header