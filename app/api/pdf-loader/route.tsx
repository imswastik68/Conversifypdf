import { NextResponse } from "next/server";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

//const pdfUrl = "https://original-orca-414.convex.cloud/api/storage/f95a1c79-9a49-4d6e-add5-1f94c0fdf3f5"

export async function GET( request: Request ) {

    const reqUrl = request.url;
    const { searchParams } = new URL(reqUrl);
    const pdfUrl = searchParams.get("pdfUrl");
    //Load the PDF
    if (!pdfUrl) {
        return NextResponse.json({ error: "Invalid or missing pdfUrl parameter" }, { status: 400 });
    }
    const response = await fetch(pdfUrl);
    const data = await response.blob();
    const loader = new WebPDFLoader(data);
    const docs = await loader.load();

    let pdfTextContent = " ";
    docs.forEach(doc => {
        pdfTextContent += doc.pageContent;
    })

    //Split text into small chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 100,
        chunkOverlap: 20,
    });
    const output = await textSplitter.splitText(pdfTextContent);

    const splitterList: string[] = [];
    output.forEach(doc => {
        splitterList.push(doc);
    })
    

    return NextResponse.json({result:splitterList})
}