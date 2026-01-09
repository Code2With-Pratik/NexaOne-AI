import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { topic, tone, length } = body;

    if (!userId) return new NextResponse("Unauthorized", { status: 401 });
    if (!process.env.GROQ_API_KEY) return new NextResponse("API Key Missing", { status: 500 });
    if (!topic) return new NextResponse("Topic is required", { status: 400 });

    // Use "llama3-8b-8192" (Fast & Efficient) or "llama3-70b-8192" (Smarter)
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
    //   model: "llama3-70b-8192", // The smart model (GPT-4 class)
      model: "openai/gpt-oss-20b", // The smart model (GPT-4 class)
      temperature: 0.7,
      max_tokens: 2000,
    });

    const text = completion.choices[0]?.message?.content || "";

    return NextResponse.json(text);

  } catch (error) {
    console.log("[GROQ_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}