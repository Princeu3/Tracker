"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

type Props = {
  value: number | null;
  currencyCode?: string;
  onChange: (value: number | null) => void;
};

export function CurrencyCell({
  value,
  currencyCode = "USD",
  onChange,
}: Props) {
  const [localValue, setLocalValue] = useState(value?.toString() ?? "");
  const [editing, setEditing] = useState(false);

  if (!editing && value != null) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="w-full px-2 text-right text-sm tabular-nums"
      >
        {new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: currencyCode,
        }).format(value)}
      </button>
    );
  }

  return (
    <Input
      type="number"
      step="0.01"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={() => {
        setEditing(false);
        const num = localValue === "" ? null : Number(localValue);
        if (num !== value) onChange(num);
      }}
      autoFocus={editing}
      className="h-8 border-0 rounded-none bg-transparent px-2 shadow-none transition-all duration-150 focus-visible:ring-0 focus-visible:border-transparent text-right tabular-nums"
    />
  );
}
