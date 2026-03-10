"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { SchemaPreview } from "./schema-preview";
import { parseSchemaFromResponse, hasSchemaInResponse } from "@/lib/ai/schema-parser";
import { createTracker } from "@/actions/tracker";
import { toast } from "sonner";
import type { GeneratedSchema } from "@/types";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export function ChatContainer() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I can help you create a custom tracker. What would you like to track? For example:\n\n- Apartment hunting\n- Job applications\n- Books to read\n- Workout routines\n- Expense tracking\n\nJust describe what you want to track and I'll create the perfect schema for you!",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [schema, setSchema] = useState<GeneratedSchema | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  async function sendMessage(content: string) {
    const userMessage: Message = { role: "user", content, timestamp: new Date() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) throw new Error("Failed to get response");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      let assistantContent = "";
      const assistantTimestamp = new Date();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", timestamp: assistantTimestamp },
      ]);

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantContent += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: assistantContent,
            timestamp: assistantTimestamp,
          };
          return updated;
        });
      }

      if (hasSchemaInResponse(assistantContent)) {
        const parsed = parseSchemaFromResponse(assistantContent);
        if (parsed) setSchema(parsed);
      }
    } catch (error) {
      toast.error("Failed to get AI response");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateTracker(finalSchema: GeneratedSchema) {
    setIsCreating(true);
    try {
      const tracker = await createTracker({
        name: finalSchema.name,
        description: finalSchema.description,
        columns: finalSchema.columns,
      });
      toast.success("Tracker created!");
      router.push(`/tracker/${tracker.id}`);
    } catch (error) {
      toast.error("Failed to create tracker");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="flex h-full gap-6">
      <div className="flex flex-1 flex-col min-h-0">
        <div ref={scrollRef} className="flex-1 overflow-auto p-4">
          <ChatMessages messages={messages} isLoading={isLoading} />
        </div>
        <div className="border-t p-4">
          <ChatInput onSend={sendMessage} disabled={isLoading} />
        </div>
      </div>

      {schema && (
        <div className="w-96 border-l p-4 overflow-auto animate-slide-in-right">
          <SchemaPreview
            schema={schema}
            onChange={setSchema}
            onCreateTracker={handleCreateTracker}
            isCreating={isCreating}
          />
        </div>
      )}
    </div>
  );
}
