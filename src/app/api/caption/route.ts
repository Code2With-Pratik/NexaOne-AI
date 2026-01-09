import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { platform, description } = body;

    if (!userId) return new NextResponse("Unauthorized", { status: 401 });
    if (!process.env.GROQ_API_KEY) return new NextResponse("API Key Missing", { status: 500 });

    const systemPrompt = `You are a social media expert. 
    Generate 3 distinct caption options for ${platform}.
    Output strictly a JSON array of strings. Example: ["Caption 1", "Caption 2", "Caption 3"].
    Do not output any markdown formatting or explanation. Only the raw array.`;

    const userPrompt = `
      Topic: ${description}
      Platform Rules:
      - Instagram: engaging, emojis, 10-20 hashtags.
      - Twitter: short, punchy, under 280 chars, 2-3 hashtags.
      - LinkedIn: professional, storytelling, business value, 3-5 hashtags.
    `;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      model: "openai/gpt-oss-20b",
      temperature: 0.7,
    });

    let content = completion.choices[0]?.message?.content || "[]";

    // Clean up if AI adds Markdown code blocks (```json ... ```)
    content = content.replace(/```json/g, "").replace(/```/g, "").trim();

    // Parse the string into a real array
    let captionsArray = [];
    try {
      captionsArray = JSON.parse(content);
    } catch (e) {
      console.error("JSON Parse Error", e);
      // Fallback if JSON fails: just return the raw text in an array
      captionsArray = [content];
    }

    return NextResponse.json(captionsArray);

  } catch (error) {
    console.log("[CAPTION_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}