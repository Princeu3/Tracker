import { auth } from "@/auth";
import { getOpenAI } from "@/lib/ai/client";
import { SCHEMA_GENERATION_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messages, currentSchema } = await req.json();

  const systemMessages: { role: "system"; content: string }[] = [
    { role: "system", content: SCHEMA_GENERATION_SYSTEM_PROMPT },
  ];

  if (currentSchema) {
    systemMessages.push({
      role: "system",
      content: `The user's current schema (including any manual edits they made in the preview panel) is:\n\n${JSON.stringify(currentSchema, null, 2)}\n\nWhen the user asks for changes, modify THIS schema incrementally — do not regenerate from scratch. Keep all existing columns, names, and options unless the user specifically asks to change them.`,
    });
  }

  const stream = await getOpenAI().chat.completions.create({
    model: "gpt-4o",
    stream: true,
    messages: [
      ...systemMessages,
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
