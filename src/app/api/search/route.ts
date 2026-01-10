import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Groq from "groq-sdk"; // 1. Import Groq

// 2. Initialize Groq Client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { query, type, page = 1 } = body;

    if (!userId) return new NextResponse("Unauthorized", { status: 401 });
    if (!process.env.SERPER_API_KEY) return new NextResponse("Serper Key Missing", { status: 500 });
    // Note: Make sure GROQ_API_KEY is in your .env file!

    // --- A. Perform Search (Serper) ---
    let url = "https://google.serper.dev/search";
    if (type === "images") url = "https://google.serper.dev/images";
    if (type === "videos") url = "https://google.serper.dev/videos";
    if (type === "news")   url = "https://google.serper.dev/news";

    const serperResponse = await fetch(url, {
      method: "POST",
      headers: {
        "X-API-KEY": process.env.SERPER_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: query, num: 10, page }),
    });

    if (!serperResponse.ok) {
      return new NextResponse("Search Failed", { status: 500 });
    }

    const data = await serperResponse.json();

    // --- B. Generate AI Overview (Groq) ---
    // Only run for "search" tab on the first page
    let aiOverview = null;

    if (type === "search" && page === 1 && data.organic && data.organic.length > 0) {
      try {
        // Prepare context from top 4 results
        const context = data.organic.slice(0, 4).map((item: any) => item.snippet).join("\n");
        
        const aiResponse = await groq.chat.completions.create({
          messages: [
            { 
              role: "system", 
              content: "You are an AI search assistant. Create a concise, 3-4 sentence summary answer based ONLY on the provided search snippets. Do not mention 'the snippets'. Just answer the user's query directly." 
            },
            { 
              role: "user", 
              content: `User Query: ${query}\n\nSearch Snippets:\n${context}` 
            }
          ],
          // 3. Use a Fast Groq Model (Llama 3 is great here)
          model: "openai/gpt-oss-20b", 
          temperature: 0.5,
          max_tokens: 200,
        });

        aiOverview = aiResponse.choices[0]?.message?.content || null;
      } catch (error) {
        console.log("Groq Overview Error:", error);
      }
    }

    // Return combined data
    return NextResponse.json({ ...data, aiOverview });

  } catch (error) {
    console.log("[SEARCH_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}