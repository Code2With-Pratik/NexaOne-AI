import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { checkApiLimit, deductCredits } from "@/lib/api-limit";
import { db } from "@/lib/db"; // For history logging

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { prompt, resolution = "1024x1024" } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!process.env.HUGGING_FACE_TOKEN) {
      return new NextResponse("API Key Missing", { status: 500 });
    }

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    // 1. CHECK CREDITS
    const hasCredits = await checkApiLimit();
    if (!hasCredits) {
      return new NextResponse("Free trial has expired. Please upgrade.", { status: 403 });
    }

    // We will use the powerful "Stable Diffusion XL" model
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: prompt,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Hugging Face Error:", errorText);
      return new NextResponse("Image Generation Failed", { status: 500 });
    }

    // Hugging Face returns raw binary image data (Blob)
    // We need to convert it to base64 to show it in the browser
    const buffer = await response.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString("base64");
    const imageUrl = `data:image/jpeg;base64,${base64Image}`;

    // 2. DEDUCT CREDITS (Cost: 5 credits for an image)
    // We deduct AFTER we confirm the image generated successfully
    await deductCredits(5);

    // 3. SAVE TO HISTORY
    await db.history.create({
      data: {
        userId: userId,
        tool: "Image Generator",
        query: prompt,
        result: imageUrl // NOTE: For production, better to upload to Cloudinary/S3 and store the URL here
      }
    });

    return NextResponse.json(imageUrl);

  } catch (error) {
    console.log("[IMAGE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}