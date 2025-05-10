import { NextResponse } from "next/server";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export async function GET(request: Request) {
  try {
    // Extract PDF URL from request parameters
    const reqUrl = request.url;
    const { searchParams } = new URL(reqUrl);
    const pdfUrl = searchParams.get("pdfUrl");
    
    // Validate PDF URL
    if (!pdfUrl) {
      return NextResponse.json(
        { error: "Missing pdfUrl parameter" }, 
        { status: 400 }
      );
    }
    
    // Get chunk size and overlap from parameters or use defaults
    const chunkSize = parseInt(searchParams.get("chunkSize") || "1000");
    const chunkOverlap = parseInt(searchParams.get("chunkOverlap") || "200");
    
    // Fetch and load the PDF
    console.log(`Loading PDF from: ${pdfUrl}`);
    const response = await fetch(pdfUrl);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch PDF: ${response.statusText}` }, 
        { status: response.status }
      );
    }
    
    const data = await response.blob();
    const loader = new WebPDFLoader(data);
    const docs = await loader.load();
    
    // Process PDF content
    console.log(`PDF loaded with ${docs.length} pages`);
    
    // Extract text and preserve page numbers for reference
    const processedDocs = docs.map((doc, index) => {
      return {
        pageContent: doc.pageContent,
        metadata: {
          ...doc.metadata,
          page: index + 1
        }
      };
    });
    
    // Split text into chunks with metadata
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap,
    });
    
    // Create document chunks with metadata preserved
    const chunks = await textSplitter.splitDocuments(processedDocs);
    
    // Format the result for better question-answering
    const result = chunks.map((chunk, index) => {
      return {
        id: `chunk-${index}`,
        content: chunk.pageContent,
        metadata: {
          page: chunk.metadata.page,
          loc: chunk.metadata.loc,
          chunkIndex: index
        }
      };
    });
    
    return NextResponse.json({
      status: "success",
      documentInfo: {
        totalPages: docs.length,
        totalChunks: result.length,
        chunkSize,
        chunkOverlap
      },
      chunks: result
    });
  } catch (error: any) {
    console.error("Error processing PDF:", error);
    return NextResponse.json(
      { 
        error: "Failed to process PDF",
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}

// For handling POST requests to answer questions
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pdfUrl, question, chunks } = body;
    
    if (!pdfUrl && !chunks) {
      return NextResponse.json(
        { error: "Either pdfUrl or chunks must be provided" },
        { status: 400 }
      );
    }
    
    if (!question) {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }
    
    // If chunks are provided, use them directly
    if (chunks) {
      // Here you would implement the question answering logic using the provided chunks
      // This could involve passing them to an LLM API with the question
      
      return NextResponse.json({
        status: "success",
        question,
        // This is where you'd connect to your LLM of choice to get the answer
        message: "Question answering with provided chunks is not implemented in this example"
      });
    }
    
    // Otherwise, fetch and process the PDF first
    // You can reuse the GET functionality here
    const url = new URL(request.url);
    url.searchParams.set("pdfUrl", pdfUrl);
    
    const pdfResponse = await GET(new Request(url.toString()));
    const pdfData = await pdfResponse.json();
    
    if (pdfData.error) {
      return NextResponse.json(pdfData, { status: 400 });
    }
    
    // Use the processed chunks for question answering
    // Here you would implement the question answering logic
    
    return NextResponse.json({
      status: "success",
      question,
      documentInfo: pdfData.documentInfo,
      // This is where you'd connect to your LLM of choice to get the answer
      message: "Question answering directly from PDF URL is not implemented in this example"
    });
  } catch (error: any) {
    console.error("Error answering question:", error);
    return NextResponse.json(
      { 
        error: "Failed to answer question",
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}