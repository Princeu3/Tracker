"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

type Props = {
  value: number | null;
  onChange: (value: number | null) => void;
};

export function NumberCell({ value, onChange }: Props) {
  const [localValue, setLocalValue] = useState(value?.toString() ?? "");

  return (
    <Input
      type="number"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={() => {
        const num = localValue === "" ? null : Number(localValue);
        if (num !== value) onChange(num);
      }}
      className="h-8 border-0 rounded-none bg-transparent px-2 shadow-none transition-all duration-150 focus-visible:ring-0 focus-visible:border-transparent text-right tabular-nums"
    />
  );
}
