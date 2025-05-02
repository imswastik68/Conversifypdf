"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2Icon } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@clerk/nextjs";


function UploadPdfDialogue({isMaxFile} : {isMaxFile: boolean}) {

    const generateUploadUrl= useMutation(api.fileStorage.generateUploadUrl);
    const addFileEntry= useMutation(api.fileStorage.addFileEntryToDb);
    const getFileUrl = useMutation(api.fileStorage.getFileUrl);
    const embedddDocumnent = useAction(api.myActions.ingest)
    const {user} = useUser();
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [fileName, setFileName] = useState("");
    const [open, setOpen] = useState(false);

    interface FileSelectEvent extends React.ChangeEvent<HTMLInputElement> {
        target: HTMLInputElement & EventTarget & { files: FileList };
    }

    const OnFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    }

    const OnUpload = async() => {
        setLoading(true);

        // Step 1: Get a short-lived upload URL
        const postUrl = await generateUploadUrl();

        // Step 2: POST the file to the URL
        const result = await fetch(postUrl, {
        method: "POST",
        headers: file?.type ? { "Content-Type": file.type } : undefined,
        body: file,
        });

        const { storageId } = await result.json();
        const fileId = uuidv4();
        const fileUrl = await getFileUrl({storageId: storageId});

        // Step 3: Add a record to the database
        const resp = await addFileEntry({
            fileId: fileId,
            storageId: storageId,
            fileName: fileName??"Untitled File",
            fileUrl: fileUrl ?? "",
            createdBy: user?.primaryEmailAddress?.emailAddress ?? ""
        })

        //API call to fetch pdf process data
        const ApiResp = await fetch("/api/pdf-loader?pdfUrl="+fileUrl);
        const ApiRespJson = await ApiResp.json();
        await embedddDocumnent({
            slitText: ApiRespJson.result,
            fileId: fileId
        });

        setLoading(false);
        setOpen(false);
    }

    return (
        <Dialog open={open} >
            <DialogTrigger asChild>
                <Button onClick = {() => setOpen(true)} disabled={isMaxFile} className="w-full" >+ Upload PDF File</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>Upload PDF File</DialogTitle>
                <DialogDescription asChild>
                    <div>
                    <h2 className="mt-3">Select a file to Upload</h2>
                        <div className="flex gap-2 p-3 rounded-md border">
                            <input type="file" accept="application/pdf" 
                            onChange={(e) => OnFileSelect(e)}
                            />
                        </div>

                        <div className="mt-2">
                            <label>File Name</label>
                            <Input placeholder="File Name" 
                            onChange={(e) => setFileName(e.target.value)}
                            />
                        </div>

                        <div>

                        </div>
                    </div>
                </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-end">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                        Close
                        </Button>
                    </DialogClose>
                    <Button onClick={OnUpload} disabled={loading} >
                        {
                            loading?
                                <Loader2Icon className="animate-spin"/> : "Upload"
                        }
                        </Button>
                </DialogFooter>
            </DialogContent>    
        </Dialog>

    )
}

export default UploadPdfDialogue