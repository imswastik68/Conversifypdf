import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Define response type for better type safety
interface GeminiResponse {
  text: string;
  usage?: {
    promptTokens: number;
    candidatesTokens: number;
    totalTokens: number;
  };
}

// Define error response type
interface ErrorResponse {
  error: string;
  details?: unknown;
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error('Invalid JSON:', error);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' } as ErrorResponse,
        { status: 400 }
      );
    }

    // Validate the prompt
    const { prompt, maxTokens, temperature } = body;
    
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' } as ErrorResponse,
        { status: 400 }
      );
    }

    if (prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt cannot be empty' } as ErrorResponse,
        { status: 400 }
      );
    }

    // Check if API key is configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Missing Gemini API key configuration');
      return NextResponse.json(
        { error: 'Gemini API key is not configured on the server' } as ErrorResponse,
        { status: 500 }
      );
    }

    // Initialize the Gemini API client
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Use Gemini 2.0 Flash model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        maxOutputTokens: maxTokens || 2048,
        temperature: temperature || 0.7,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });
    
    // Record the start time for metrics
    const startTime = Date.now();
    
    // Generate content with proper error handling
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Basic token counting estimation (could be replaced with actual counts if the API provides them)
    const promptTokens = Math.ceil(prompt.length / 4);
    const responseTokens = Math.ceil(text.length / 4);
    
    // Calculate time taken
    const timeTaken = Date.now() - startTime;
    
    console.log(`Gemini request processed in ${timeTaken}ms`);
    
    // Return response with metrics
    const responseData: GeminiResponse = {
      text,
      usage: {
        promptTokens,
        candidatesTokens: responseTokens,
        totalTokens: promptTokens + responseTokens
      }
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error in Gemini API route:', error);
    
    // Handle specific error types from the Gemini API
    if (error instanceof Error) {
      // Check if it's a rate limit error
      if (error.message.includes('rate limit') || error.message.includes('quota')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded for Gemini API', details: error.message } as ErrorResponse,
          { status: 429 }
        );
      }
      
      // Handle auth errors
      if (error.message.includes('authentication') || error.message.includes('auth') || error.message.includes('key')) {
        return NextResponse.json(
          { error: 'Authentication error with Gemini API', details: error.message } as ErrorResponse,
          { status: 401 }
        );
      }
    }
    
    // Generic error response
    return NextResponse.json(
      { error: 'Failed to generate response', details: error instanceof Error ? error.message : String(error) } as ErrorResponse,
      { status: 500 }
    );
  }
}

// Add a HEAD method to support health checks
export async function HEAD() {
  return new Response(null, { status: 200 });
}