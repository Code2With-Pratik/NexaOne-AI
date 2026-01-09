import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

    // UPDATED MODEL NAME VVV
    // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    // Use the specific version tag which is more reliable
    // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    // Use the specific version number (Most reliable)
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const lastMessage = messages[messages.length - 1];
    const prompt = lastMessage.content;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      role: "assistant", 
      content: text 
    });

  } catch (error) {
    console.log("[CONVERSATION_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}