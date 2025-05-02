import type { Metadata } from "next";
import "./globals.css";
import {Outfit} from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs";
import Provider from "./provider";
import { Toaster } from "sonner";


export const metadata: Metadata = {
  title: "ConversifyPDF",
  description: 'Transform your PDF documents into intelligent notes with AI-powered insights and summaries.',
};

const outfit = Outfit({subsets: ['latin']});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="scroll-smooth">
        <body
          className= {outfit.className}
        >
          <Provider>
            {children}    
          </Provider>   
          <Toaster />     
        </body>
      </html>
    </ClerkProvider>
    
  );
}
