import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Groq from "groq-sdk";

// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { recipient, tone, context } = body;

    if (!userId) return new NextResponse("Unauthorized", { status: 401 });
    if (!process.env.GROQ_API_KEY) return new NextResponse("API Key Missing", { status: 500 });
    
    // We use Llama 3 70b because it is excellent at following tone instructions
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a professional email writer. Output ONLY the email body. Do not include conversational filler like 'Here is the email'."
        },
        {
          role: "user",
          content: `Write a professional email with these details:
          
          - Recipient: ${recipient}
          - Tone: ${tone}
          - Context/Key Points: ${context}
          
          Requirements:
          1. Start with a clear Subject Line (e.g., Subject: ...)
          2. Use the specified tone.
          3. Keep it concise and effective.`
        }
      ],
      model: "openai/gpt-oss-20b", 
      temperature: 0.6, // Slightly lower temperature for more consistent/professional results
      max_tokens: 1024,
    });

    const text = completion.choices[0]?.message?.content || "";

    return NextResponse.json(text);

  } catch (error) {
    console.log("[EMAIL_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}