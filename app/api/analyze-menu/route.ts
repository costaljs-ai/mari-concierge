import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { z } from 'zod';

export const maxDuration = 300;  

const UploadSchema = z.object({
  image: z.string().regex(/^data:image\/(jpeg|png|webp);base64,/, "Invalid image format"),
  track: z.enum(['Beginner', 'Experienced']),
  preferences: z.string().max(1000).default(""), 
});

export async function POST(req: Request) {
  try {
    const jsonBody = await req.json().catch(() => ({}));
    
    const parsed = UploadSchema.safeParse(jsonBody);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload contract', details: parsed.error.format() }, { status: 400 });
    }

    const { image, track, preferences } = parsed.data;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const matches = image.match(/^data:(image\/(jpeg|png|webp));base64,(.+)$/);
    if (!matches) return NextResponse.json({ error: 'Image parsing failed.' }, { status: 400 });
    
    const mimeType = matches[1];
    const base64Data = matches[3];

    if (base64Data.length > 5.3 * 1024 * 1024) { 
      return NextResponse.json({ error: 'Payload too large.' }, { status: 413 });
    }

    const prompt = `You are Mari the Concierge, an expert cannabis guide. The user is a ${track}.
    
    === USER PREFERENCES ===
    ${preferences.trim() || "No specific preferences provided."}
    === END PREFERENCES ===

    Analyze this dispensary menu image. Return a structured JSON response with exactly 3 product recommendations.
    For each, provide the 'productName' and a 'reason' detailing why its terpenes/effects match the user preferences.
    If the user is a Beginner, use educational language. If Experienced, use direct, terpene-focused language.
    Include a strict medical disclaimer at the end of the JSON.`;

    const generateWithFallback = async () => {
      const models = ['gemini-3.8-flash', 'gemini-4-argon'];
      for (const modelName of models) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent([
            prompt,
            { inlineData: { data: base64Data, mimeType } }
          ]);
          return result.response.text();
        } catch (error: any) {
          console.warn(`Model ${modelName} failed.`, error.message);
          if (!error.message.includes('503') && !error.message.includes('429')) {
             throw new Error('AI processing failed due to a non-transient error.');
          }
        }
      }
      throw new Error('All backend models are currently at capacity. Please try again in a few minutes.');
    };

    const rawResponse = await generateWithFallback();
    
    const cleanJson = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const structuredData = JSON.parse(cleanJson);

    let formattedResponse = `Here are your top matches based on the menu:\n\n`;
    structuredData.recommendations?.forEach((rec: any, index: number) => {
      formattedResponse += `**${index + 1}. ${rec.productName}**\n${rec.reason}\n\n`;
    });
    formattedResponse += `\n*${structuredData.disclaimer || "Reminder: This is not medical advice."}*`;

    return NextResponse.json({ analysis: formattedResponse });

  } catch (error: unknown) {
    return NextResponse.json({ error: 'An internal server error occurred during analysis.' }, { status: 500 });
  }
}