"use client";

import { Input } from "@/components/ui/input";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function DateCell({ value, onChange }: Props) {
  return (
    <Input
      type="date"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 border-0 rounded-none bg-transparent px-2 shadow-none transition-all duration-150 focus-visible:ring-0 focus-visible:border-transparent"
    />
  );
}
