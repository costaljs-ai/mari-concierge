import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export const maxDuration = 60; 

export async function POST(req: Request) {
  try {
    // Read the request as pure JSON instead of buggy FormData
    const body = await req.json();
    const { image, track, preferences, chatHistory } = body;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'API key is missing.' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Handle Follow-Up Chat
    if (chatHistory) {
      const prompt = `You are Mari the Concierge, a highly knowledgeable cannabis guide. 
      The user is on the ${track} track. 
      Here is the conversation history: ${JSON.stringify(chatHistory)}
      
      The user just asked a follow-up question: "${preferences}"
      Answer their question conversationally, keeping their experience level in mind.`;
      
      const result = await model.generateContent(prompt);
      return NextResponse.json({ analysis: result.response.text() });
    }

    // Handle Initial Image Upload
    if (!image) {
      return NextResponse.json({ error: 'No menu image provided. Please try uploading again.' }, { status: 400 });
    }

    // Extract the raw base64 data and mime type from the string
    const matches = image.match(/^data:(.+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return NextResponse.json({ error: 'Invalid image format received.' }, { status: 400 });
    }
    
    const mimeType = matches[1];
    const base64Data = matches[2];

    const prompt = `You are Mari the Concierge, an expert cannabis guide.
    The user is on the "${track}" track. 
    Their natural language preferences/goals are: "${preferences}".

    Please analyze this dispensary menu image. 
    1. Rank the top 3 best matching products for this user.
    2. Explicitly state WHY each product's effects and terpene profile align with their goals.
    
    TONE INSTRUCTIONS:
    - If they are "Beginner": Guide them gently. Educate them on what the terpenes do. Make them feel comfortable.
    - If they are "Experienced": Be direct, focus on convenience, specific effects, and top-shelf terpene alignment without basic over-explaining.
    
    Format the response clearly with bolding for product names.`;

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

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process.' }, { status: 500 });
  }
}