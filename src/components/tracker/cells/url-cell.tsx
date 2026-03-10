"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ExternalLink } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function UrlCell({ value, onChange }: Props) {
  const [localValue, setLocalValue] = useState(value);
  const [editing, setEditing] = useState(false);

  if (!editing && value) {
    return (
      <div className="flex items-center gap-1 px-2">
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="truncate text-sm text-primary hover:text-primary/80 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {value}
        </a>
        <button onClick={() => setEditing(true)} className="shrink-0">
          <ExternalLink className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>
    );
  }

  return (
    <Input
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={() => {
        setEditing(false);
        if (localValue !== value) onChange(localValue);
      }}
      autoFocus={editing}
      placeholder="https://..."
      className="h-8 border-0 rounded-none bg-transparent px-2 shadow-none transition-all duration-150 focus-visible:ring-0 focus-visible:border-transparent"
    />
  );
}
