import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export const maxDuration = 300; 
export const dynamic = 'force-dynamic'; 

export async function POST(req: Request) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON payload received.' }, { status: 400 });
    }

    const { image, track, preferences, chatHistory } = body;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'API key configuration missing.' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // --- NEW: Enterprise Fallback Function ---
    // This will try 3.8-flash. If Google servers are busy (503), it instantly falls back to 4-argon.
    const generateWithFallback = async (promptText: string, imagePart?: any) => {
      const models = ['gemini-3.8-flash', 'gemini-4-argon'];
      let lastError;

      for (const modelName of models) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const payload = imagePart ? [promptText, imagePart] : promptText;
          const result = await model.generateContent(payload);
          return result.response.text();
        } catch (error: any) {
          console.warn(`Model ${modelName} failed:`, error.message);
          lastError = error;
          // If the error is NOT a 503 (server busy) or 429 (rate limit), don't bother retrying, just throw it.
          if (!error.message.includes('503') && !error.message.includes('429') && !error.message.includes('unavailable')) {
            throw error;
          }
        }
      }
      throw lastError; // If all fallback models are busy, then we finally throw the error.
    };

    // Handle Follow-Up Chat
    if (chatHistory && Array.isArray(chatHistory)) {
      const prompt = `You are Mari the Concierge, a highly knowledgeable cannabis guide. 
      The user is on the ${track} track. 
      Here is the conversation history: ${JSON.stringify(chatHistory)}
      
      Answer their latest question conversationally, keeping their experience level in mind.
      REMINDER: Do not provide medical advice.`;
      
      const analysisText = await generateWithFallback(prompt);
      return NextResponse.json({ analysis: analysisText });
    }

    // Handle Initial Image Upload
    if (!image) {
      return NextResponse.json({ error: 'No menu image provided.' }, { status: 400 });
    }

    const matches = image.match(/^data:(image\/(jpeg|png|webp));base64,(.+)$/);
    if (!matches || matches.length !== 4) {
      return NextResponse.json({ error: 'Invalid image format. Only JPG, PNG, and WEBP are supported.' }, { status: 400 });
    }
    
    const mimeType = matches[1];
    const base64Data = matches[3];

    if (base64Data.length > 5.3 * 1024 * 1024) { 
      return NextResponse.json({ error: 'Image is too large after processing. Please try a smaller image.' }, { status: 413 });
    }

    const prompt = `You are Mari the Concierge, an expert cannabis guide.
    The user is on the "${track}" track. 
    Their natural language preferences/goals are: "${preferences}".

    Please analyze this dispensary menu image. 
    1. Rank the top 3 best matching products for this user.
    2. Explicitly state WHY each product's effects and terpene profile align with their goals.
    
    TONE INSTRUCTIONS:
    - If they are "Beginner": Guide them gently. Educate them on what the terpenes do.
    - If they are "Experienced": Be direct, focus on specific effects and top-shelf terpene alignment.
    
    IMPORTANT RESTRICTIONS:
    - Include a brief statement that this is not medical advice.
    - Format clearly with bolding for product names.`;

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    };

    const analysisText = await generateWithFallback(prompt, imagePart);
    return NextResponse.json({ analysis: analysisText });

  } catch (error: unknown) {
    console.error('Gemini API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}