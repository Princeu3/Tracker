"use client";

type Props = {
  value: boolean;
  onChange: (value: boolean) => void;
};

export function CheckboxCell({ value, onChange }: Props) {
  return (
    <div className="flex items-center justify-center">
      <input
        type="checkbox"
        checked={value || false}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-input accent-primary cursor-pointer hover:scale-110 transition-transform duration-100"
      />
    </div>
  );
}
