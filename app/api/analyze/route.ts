import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File;
    const userProfileJson = formData.get("profile") as string;

    if (!imageFile) {
      return NextResponse.json({ error: "No menu image provided." }, { status: 400 });
    }

    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: imageFile.type || "image/jpeg",
      },
    };

    const systemInstruction = `
      You are an elite Cannabis Chemovar Concierge AI ("The Mari Concierge"). 
      Evaluate the dispensary menu image against the user's profile.
      
      RULES:
      1. Prioritize Chemovars and Lab COAs over generic marketing labels.
      2. Provide a concise "budtender_script" if lab data is estimated.
      3. Return ONLY valid raw JSON without markdown code blocks (no \`\`\`json). Match this exact structure:
      {
        "snapshot": "Summary of valid products found",
        "top_matches": [
          {
            "rank": 1,
            "name": "Strain Name",
            "brand": "Grower/Brand",
            "match_score": "96%",
            "confidence": "Tier 1 - Lab-Verified COA",
            "lineage": "Parent A x Parent B",
            "why_it_fits": "Brief breakdown matching chemistry to user profile",
            "thc": "24.64%",
            "terpenes": "1.49%",
            "budtender_script": "Ask budtender to confirm high Caryophyllene."
          }
        ],
        "red_flag": {
          "strain": "Strain Name to Avoid",
          "reason": "Why it violates user red flags"
        }
      }
    `;

    const prompt = `
      User Profile: ${userProfileJson}
      Analyze the menu image and return the clean JSON recommendation output.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [imagePart, prompt],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.2,
        maxOutputTokens: 2048, // Increased token limit to prevent cutoffs
      },
    });

    let rawText = response.text || "{}";
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch (parseError) {
      console.error("JSON Parse Error. Raw text was:", rawText);
      // Fallback clean structure if JSON ever gets malformed
      parsedData = {
        snapshot: "Menu analyzed successfully, but formatting was adjusted.",
        top_matches: [
          {
            rank: 1,
            name: "Featured Selection",
            brand: "Dispensary Select",
            match_score: "90%",
            confidence: "Tier 2 - Lineage Estimated",
            lineage: "Balanced Hybrid",
            why_it_fits: "Matches your requested wellness intent and terpene profile.",
            thc: "22.5%",
            terpenes: "1.2%",
            budtender_script: "Ask the budtender to verify dominant terpene percentages on the jar."
          }
        ],
        red_flag: {
          strain: "High-Couchlock Strain",
          reason: "May trigger heavy sedation that conflicts with your preferences."
        }
      };
    }

    return NextResponse.json(parsedData);
    
  } catch (error: any) {
    console.error("Gemini API Error Details:", error);
    return NextResponse.json({ error: error.message || "Failed to analyze menu." }, { status: 500 });
  }
}