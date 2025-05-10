import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const addFileEntryToDb = mutation({
    args:{
        fileId: v.string(),
        storageId: v.string(),
        fileName: v.string(),
        fileUrl: v.string(),
        createdBy: v.string()
    },
    handler: async(ctx, args) => { 
        const result = await ctx.db.insert("pdfFiles", {
            fileId: args.fileId,
            storageId: args.storageId,
            fileName: args.fileName,
            fileUrl: args.fileUrl,
            createdBy: args.createdBy
        });
        return result;
    }
})

export const getFileUrl = mutation({
    args:{
        storageId: v.string()
    },
    handler: async(ctx, args) => {
        const url = await ctx.storage.getUrl(args.storageId);
        return url;
    }
})

export const GetFileRecord = query({
    args: {
        fileId: v.string()
    },
    handler: async(ctx, args) => {
        const result = await ctx.db.query("pdfFiles")
        .filter((q) => q.eq(q.field("fileId"), args.fileId))
        .collect();
        
        return result[0];
    }
})

export const GetUderFiles = query({
    args:{
        userEmail: v.optional(v.string())
    },
    handler: async (ctx, args) => {

        if (!args?.userEmail) return;

        const result = await ctx.db.query("pdfFiles")
        .filter(q => q.eq(q.field("createdBy"), args.userEmail))
        .collect();
        
        return result;
    }
})

// New function to check if a file exists
export const CheckFileExists = query({
    args: {
        fileId: v.string()
    },
    handler: async (ctx, args) => {
        // First, try to get the file record
        const fileRecord = await ctx.db.query("pdfFiles")
            .filter((q) => q.eq(q.field("fileId"), args.fileId))
            .first();
        
        // If no record exists, return false
        if (!fileRecord) {
            return { exists: false, message: "File record not found", storageId: null, fileUrl: null, debugInfo: { fileRecord: null } };
        }
        
        // Log the full file record for debugging
        const debugInfo = {
            fileRecord: {
                ...fileRecord,
                // Include these fields specifically to ensure they're logged
                fileId: fileRecord.fileId,
                storageId: fileRecord.storageId,
                fileUrl: fileRecord.fileUrl
            }
        };
        
        // Try to use the direct fileUrl if it exists in the record
        if (fileRecord.fileUrl) {
            return { 
                exists: true, 
                message: "File found with direct URL", 
                storageId: fileRecord.storageId || "not_needed",
                fileUrl: fileRecord.fileUrl,
                debugInfo
            };
        }
        
        // If we have a storageId, check if the file exists in storage
        if (fileRecord.storageId) {
            try {
                const url = await ctx.storage.getUrl(fileRecord.storageId);
                if (url) {
                    return { 
                        exists: true, 
                        message: "File found via storage", 
                        storageId: fileRecord.storageId,
                        fileUrl: url,
                        debugInfo
                    };
                } else {
                    return { 
                        exists: false, 
                        message: "Storage ID exists but URL generation failed", 
                        storageId: fileRecord.storageId,
                        fileUrl: null,
                        debugInfo
                    };
                }
            } catch (error) {
                return { 
                    exists: false, 
                    message: "Storage error: " + (error instanceof Error ? error.message : String(error)),
                    storageId: fileRecord.storageId,
                    fileUrl: null,
                    debugInfo: { ...debugInfo, error: error instanceof Error ? error.message : String(error) }
                };
            }
        }
        
        // If we get here, the record exists but has no valid storageId or fileUrl
        return { 
            exists: false, 
            message: "File record exists but has no valid storage ID or fileUrl", 
            storageId: fileRecord.storageId || null,
            fileUrl: null,
            debugInfo
        };
    }
});

// Fix typo in function name (GetUderFiles -> GetUserFiles)
export const GetUserFiles = query({
    args:{
        userEmail: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        if (!args?.userEmail) return [];

        const result = await ctx.db.query("pdfFiles")
        .filter(q => q.eq(q.field("createdBy"), args.userEmail))
        .collect();
        
        return result;
    }
});

// Utility to fix file records that have a storageId but no fileUrl
export const fixFileRecord = mutation({
    args: {
        fileId: v.string()
    },
    handler: async (ctx, args) => {
        // Get the file record
        const fileRecord = await ctx.db.query("pdfFiles")
            .filter((q) => q.eq(q.field("fileId"), args.fileId))
            .first();
        
        if (!fileRecord) {
            return { success: false, message: "File record not found" };
        }
        
        // If we have storageId but no fileUrl, fix it
        if (fileRecord.storageId && (!fileRecord.fileUrl || fileRecord.fileUrl === "")) {
            try {
                // Generate a new URL
                const url = await ctx.storage.getUrl(fileRecord.storageId);
                
                if (!url) {
                    return { 
                        success: false, 
                        message: "Could not generate URL from storage ID",
                        fileRecord
                    };
                }
                
                // Update the record with the URL
                await ctx.db.patch(fileRecord._id, {
                    fileUrl: url
                });
                
                return {
                    success: true,
                    message: "File record updated with URL",
                    fileRecord: {
                        ...fileRecord,
                        fileUrl: url
                    }
                };
            } catch (error) {
                return {
                    success: false,
                    message: "Error generating URL: " + (error instanceof Error ? error.message : String(error)),
                    fileRecord
                };
            }
        }
        
        return {
            success: false,
            message: "File record doesn't need fixing or is missing storageId",
            fileRecord
        };
    }
});