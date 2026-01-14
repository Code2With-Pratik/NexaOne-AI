import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { checkApiLimit, deductCredits } from "@/lib/api-limit";
import { db } from "@/lib/db";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { topic, tone, length } = body;

    if (!userId) return new NextResponse("Unauthorized", { status: 401 });
    if (!process.env.GROQ_API_KEY) return new NextResponse("API Key Missing", { status: 500 });
    if (!topic) return new NextResponse("Topic is required", { status: 400 });

    // 1. CHECK CREDITS
    const hasCredits = await checkApiLimit();
    if (!hasCredits) {
      return new NextResponse("Free trial has expired. Please upgrade.", { status: 403 });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a professional blog writer. Output only valid Markdown."
        },
        {
          role: "user",
          content: `Write a creative article about "${topic}".
          
          Settings:
          - Tone: ${tone}
          - Length: ${length}
          
          Structure:
          - Use a catchy H1 Title (#)
          - Use H2 Subheadings (##)
          - Use Bullet points (*)
          - Write a clear Conclusion.
          
          Do not say "Here is the article". Just start writing.`
        }
      ],
      model: "openai/gpt-oss-20b", 
      temperature: 0.7,
      max_tokens: 2000,
    });

    const text = completion.choices[0]?.message?.content || "";

    // 2. DEDUCT CREDITS (Cost 2 because it's long-form content)
    await deductCredits(2);

    // 3. SAVE HISTORY
    await db.history.create({
      data: {
        userId,
        tool: "Article Writer",
        query: topic,
        result: text.substring(0, 1000) // Truncate output for DB if excessively long
      }
    });

    return NextResponse.json(text);

  } catch (error) {
    console.log("[GROQ_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}