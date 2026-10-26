import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Vercel Pro allows up to 300 seconds for AI processing
export const maxDuration = 300; 
// Force Vercel to always run the latest version, ignoring the cache
export const dynamic = 'force-dynamic'; 

export async function POST(req: Request) {
  try {
    // Better Error Handling: Check if the request is actually JSON
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
    const model = genAI.getGenerativeModel({ model: 'gemini-3.8-flash' });

    // Handle Follow-Up Chat
    if (chatHistory && Array.isArray(chatHistory)) {
      const prompt = `You are Mari the Concierge, a highly knowledgeable cannabis guide. 
      The user is on the ${track} track. 
      Here is the conversation history: ${JSON.stringify(chatHistory)}
      
      Answer their latest question conversationally, keeping their experience level in mind.
      REMINDER: Do not provide medical advice.`;
      
      const result = await model.generateContent(prompt);
      return NextResponse.json({ analysis: result.response.text() });
    }

    // Handle Initial Image Upload
    if (!image) {
      return NextResponse.json({ error: 'No menu image provided.' }, { status: 400 });
    }

    // Validate Base64 format securely
    const matches = image.match(/^data:(image\/(jpeg|png|webp));base64,(.+)$/);
    if (!matches || matches.length !== 4) {
      return NextResponse.json({ error: 'Invalid image format. Only JPG, PNG, and WEBP are supported.' }, { status: 400 });
    }
    
    const mimeType = matches[1];
    const base64Data = matches[3];

    // Payload size check
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

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      },
    ]);

    return NextResponse.json({ analysis: result.response.text() });

  } catch (error: unknown) {
    console.error('Gemini API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}