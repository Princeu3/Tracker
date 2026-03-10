"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function TextCell({ value, onChange }: Props) {
  const [localValue, setLocalValue] = useState(value);

  return (
    <Input
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={() => {
        if (localValue !== value) onChange(localValue);
      }}
      className="h-8 border-0 rounded-none bg-transparent px-2 shadow-none transition-all duration-150 focus-visible:ring-0 focus-visible:border-transparent"
    />
  );
}
