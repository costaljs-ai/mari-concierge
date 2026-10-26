import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { z } from 'zod';

export const maxDuration = 60; 

const MessageSchema = z.object({
  role: z.string(),
  content: z.string().max(2000),
});

const ChatSchema = z.object({
  track: z.enum(['Beginner', 'Experienced']),
  chatHistory: z.array(MessageSchema).max(50), 
});

export async function POST(req: Request) {
  try {
    const jsonBody = await req.json().catch(() => ({}));
    
    const parsed = ChatSchema.safeParse(jsonBody);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid chat payload' }, { status: 400 });
    }

    const { track, chatHistory } = parsed.data;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.8-flash' });

    const prompt = `You are Mari the Concierge, a highly knowledgeable cannabis guide. The user is a ${track}.
    
    === CONVERSATION HISTORY ===
    ${JSON.stringify(chatHistory)}
    === END HISTORY ===
    
    Answer the user's latest question directly and conversationally. Do not provide medical advice.`;

    const result = await model.generateContent(prompt);
    return NextResponse.json({ analysis: result.response.text() });

  } catch (error: unknown) {
    return NextResponse.json({ error: 'Failed to process chat request.' }, { status: 500 });
  }
}