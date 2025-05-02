import { ConvexVectorStore } from "@langchain/community/vectorstores/convex";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { action } from "./_generated/server.js";
import { TaskType } from "@google/generative-ai";
import { v } from "convex/values";

export const ingest = action({
  args: {
    slitText: v.any(),
    fileId: v.string(),
  },
  handler: async (ctx, args) => {
    await ConvexVectorStore.fromTexts(
      args.slitText,
      { id: args.fileId },
      new GoogleGenerativeAIEmbeddings({
        apiKey: "AIzaSyDog00bYX9a8e-qCMwKyJuw0d4JZHWrOho",
        model: "text-embedding-004", // 768 dimensions
        taskType: TaskType.RETRIEVAL_DOCUMENT,
        title: "Document title",
      }),
      { ctx }
    );
  },
});

export const search = action({
  args: {
    query: v.string(),
    fileId: v.string(),
  },
  handler: async (ctx, args) => {
    const vectorStore = new ConvexVectorStore(
      new GoogleGenerativeAIEmbeddings({
        apiKey: "AIzaSyDog00bYX9a8e-qCMwKyJuw0d4JZHWrOho",
        model: "text-embedding-004", // 768 dimensions
        taskType: TaskType.RETRIEVAL_DOCUMENT,
        title: "Document title",
      })
      , { ctx });

    const resultOne = await (await vectorStore.similaritySearch(args.query, 1))
    .filter(q => q.metadata.fileId === args.fileId);
    
    return JSON.stringify(resultOne);
  },
});