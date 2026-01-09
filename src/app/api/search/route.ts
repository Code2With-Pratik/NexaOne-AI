import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { query, type, page = 1 } = body; // Added 'page' default is 1

    if (!userId) return new NextResponse("Unauthorized", { status: 401 });
    if (!process.env.SERPER_API_KEY) return new NextResponse("API Key Missing", { status: 500 });

    let url = "https://google.serper.dev/search";
    if (type === "images") url = "https://google.serper.dev/images";
    if (type === "videos") url = "https://google.serper.dev/videos";
    if (type === "news")   url = "https://google.serper.dev/news";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "X-API-KEY": process.env.SERPER_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        q: query, 
        num: 10,
        page: page // Pass the page number to Serper
      }), 
    });

    if (!response.ok) {
      return new NextResponse("Search Failed", { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.log("[SEARCH_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}