import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { checkApiLimit, deductCredits } from "@/lib/api-limit"; // 👈 IMPORT
import { db } from "@/lib/db"; // 👈 IMPORT

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { messages } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!process.env.GOOGLE_API_KEY) {
      return new NextResponse("Google API Key not configured", { status: 500 });
    }

    if (!messages) {
      return new NextResponse("Messages are required", { status: 400 });
    }

    // 1. CHECK CREDITS
    const hasCredits = await checkApiLimit();
    if (!hasCredits) {
      return new NextResponse("Free trial has expired. Please upgrade.", { status: 403 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const lastMessage = messages[messages.length - 1];
    const prompt = lastMessage.content;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 2. DEDUCT CREDITS (1 Credit)
    await deductCredits(1);

    // 3. SAVE HISTORY
    // We only save the USER's last prompt and the AI's response
    await db.history.create({
      data: {
        userId,
        tool: "AI Assistant",
        query: prompt.substring(0, 200), // Truncate query if too long
        result: text
      }
    });

    return NextResponse.json({
      role: "assistant", 
      content: text 
    });

  } catch (error) {
    console.log("[CONVERSATION_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}