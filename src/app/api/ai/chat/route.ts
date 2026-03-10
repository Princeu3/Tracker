import { auth } from "@/auth";
import { getOpenAI } from "@/lib/ai/client";
import { SCHEMA_GENERATION_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messages } = await req.json();

  const stream = await getOpenAI().chat.completions.create({
    model: "gpt-4o",
    stream: true,
    messages: [
      { role: "system", content: SCHEMA_GENERATION_SYSTEM_PROMPT },
      ...messages,
    ],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          controller.enqueue(encoder.encode(content));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
