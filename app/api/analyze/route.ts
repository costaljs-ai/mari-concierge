import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// This prevents Vercel from timing out on the free hobby tier
export const maxDuration = 60; 

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const track = formData.get('track') as string;
    const preferences = formData.get('preferences') as string;
    const chatHistory = formData.get('chatHistory') as string;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'API key is missing.' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Using 1.5-flash for lightning-fast multimodal processing
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let prompt = '';

    // If this is a follow-up chat message
    if (chatHistory) {
      prompt = `You are Mari the Concierge, a highly knowledgeable cannabis guide. 
      The user is on the ${track} track. 
      Here is the conversation history: ${chatHistory}
      
      The user just asked a follow-up question: "${preferences}"
      Answer their question conversationally, keeping their experience level in mind.`;
      
      const result = await model.generateContent(prompt);
      return NextResponse.json({ analysis: result.response.text() });
    }

    // If this is the initial image upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    prompt = `You are Mari the Concierge, an expert cannabis guide.
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
          data: buffer.toString('base64'),
          mimeType: file.type,
        },
      },
    ]);

    return NextResponse.json({ analysis: result.response.text() });

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process.' }, { status: 500 });
  }
}