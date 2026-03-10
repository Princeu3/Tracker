"use client";

import { cn } from "@/lib/utils";
import { Bot, User, Loader2 } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
};

type Props = {
  messages: Message[];
  isLoading?: boolean;
};

export function ChatMessages({ messages, isLoading }: Props) {
  // Only show typing dots when loading AND no assistant message is streaming yet
  const lastMsg = messages[messages.length - 1];
  const isStreaming = isLoading && lastMsg?.role === "assistant" && lastMsg.content.length > 0;
  const showTypingDots = isLoading && !isStreaming;

  return (
    <div className="space-y-3">
      {messages.map((message, index) => {
        const isStreamingSchema =
          message.role === "assistant" &&
          message.content.includes("|||SCHEMA_START|||") &&
          !message.content.includes("|||SCHEMA_END|||");

        const displayContent = formatContent(message.content);

        // Don't render empty assistant bubbles
        if (message.role === "assistant" && !displayContent && !isStreamingSchema) {
          return null;
        }

        return (
          <div
            key={index}
            className={cn(
              "flex gap-3 animate-fade-in-up",
              message.role === "user" && "justify-end"
            )}
            style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
          >
            {message.role === "assistant" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Bot className="h-4 w-4" />
              </div>
            )}
            <div className={cn(
              "flex flex-col gap-1 max-w-[75%]",
              message.role === "user" && "items-end"
            )}>
              <div
                className={cn(
                  "px-4 py-2.5 text-sm whitespace-pre-wrap",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md"
                    : "bg-muted rounded-2xl rounded-bl-md"
                )}
              >
                {displayContent}
                {isStreamingSchema && (
                  <span className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Building schema...
                  </span>
                )}
              </div>
              {message.timestamp && (
                <span
                  className={cn(
                    "text-[10px] text-muted-foreground/60",
                    message.role === "user" ? "text-right" : "text-left"
                  )}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
            {message.role === "user" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        );
      })}

      {showTypingDots && (
        <div className="flex gap-3 animate-fade-in">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </div>
          <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="block h-2 w-2 rounded-full bg-muted-foreground/50"
                  style={{
                    animation: "typing-dot 1.4s ease-in-out infinite",
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatContent(content: string): string {
  // Strip completed schema blocks (and surrounding whitespace)
  let cleaned = content.replace(
    /\s*\|\|\|SCHEMA_START\|\|\|[\s\S]*?\|\|\|SCHEMA_END\|\|\|\s*/g,
    "\n\n"
  );
  // While streaming, the end marker may not have arrived yet —
  // truncate everything from the start marker onward
  const startIdx = cleaned.indexOf("|||SCHEMA_START|||");
  if (startIdx !== -1) {
    cleaned = cleaned.slice(0, startIdx);
  }
  // Collapse 3+ newlines into 2
  return cleaned.replace(/\n{3,}/g, "\n\n").trim();
}
