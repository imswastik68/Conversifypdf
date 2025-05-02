import React from 'react';
import { Button } from "@/components/ui/button";
import Link from "next/link";

const HeroSection = () => {
  return (
    <div className="pt-32 pb-20 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-6xl font-bold tracking-tight">
                Simplify <span className="text-red-500">PDF</span> <span className="text-blue-500">Note-Taking</span>
            <br />with <span className="text-gray-900">AI-Powered</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
                Elevate your note-taking experience with our AI-powered PDF app. Seamlessly extract key insights, summaries, and annotations from any PDF with just a few clicks
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/dashboard">
                <Button size="lg" className="text-lg px-8">
                    Get started
                </Button>
            </Link>
          </div>
        </div>
      </div>
  )
}

export default HeroSection;