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
    const { query, type, page = 1 } = body;

    if (!userId) return new NextResponse("Unauthorized", { status: 401 });
    if (!process.env.SERPER_API_KEY) return new NextResponse("Serper Key Missing", { status: 500 });

    // 1. CHECK CREDITS
    const hasCredits = await checkApiLimit();
    if (!hasCredits) {
      return new NextResponse("Free trial has expired. Please upgrade.", { status: 403 });
    }

    // --- A. Perform Search ---
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
    let aiOverview = null;

    if (type === "search" && page === 1 && data.organic && data.organic.length > 0) {
      try {
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
          model: "openai/gpt-oss-20b", 
          temperature: 0.5,
          max_tokens: 200,
        });

        aiOverview = aiResponse.choices[0]?.message?.content || null;
      } catch (error) {
        console.log("Groq Overview Error:", error);
      }
    }

    // 2. DEDUCT CREDITS
    await deductCredits(1);

    // 3. SAVE HISTORY
    // If we have an AI overview, save that. If not, just save a confirmation msg.
    await db.history.create({
      data: {
        userId,
        tool: "Search Engine",
        query: query,
        result: aiOverview ? aiOverview : `Search results for "${query}"`
      }
    });

    return NextResponse.json({ ...data, aiOverview });

  } catch (error) {
    console.log("[SEARCH_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}