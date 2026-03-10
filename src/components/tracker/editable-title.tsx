"use client";

import { updateTracker } from "@/actions/tracker";

type Props = {
  trackerId: string;
  initialName: string;
  initialDescription: string | null;
};

export function EditableTitle({ trackerId, initialName, initialDescription }: Props) {
  function handleNameBlur(e: React.FocusEvent<HTMLHeadingElement>) {
    const trimmed = (e.currentTarget.textContent || "").trim();
    if (trimmed && trimmed !== initialName) {
      updateTracker(trackerId, { name: trimmed });
    } else {
      e.currentTarget.textContent = initialName;
    }
  }

  function handleDescBlur(e: React.FocusEvent<HTMLParagraphElement>) {
    const trimmed = (e.currentTarget.textContent || "").trim();
    if (trimmed !== (initialDescription || "")) {
      updateTracker(trackerId, { description: trimmed || undefined });
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      (e.currentTarget as HTMLElement).blur();
    }
  }

  return (
    <div className="mb-6 space-y-0.5">
      <h1
        contentEditable
        suppressContentEditableWarning
        className="text-2xl font-bold tracking-tight outline-none rounded px-1 -mx-1 hover:bg-muted/50 focus:bg-muted/50 transition-colors"
        onBlur={handleNameBlur}
        onKeyDown={handleKeyDown}
      >
        {initialName}
      </h1>
      <p
        contentEditable
        suppressContentEditableWarning
        className="text-muted-foreground outline-none rounded px-1 -mx-1 hover:bg-muted/50 focus:bg-muted/50 transition-colors empty:before:content-['Add_description...'] empty:before:text-muted-foreground/40"
        onBlur={handleDescBlur}
        onKeyDown={handleKeyDown}
      >
        {initialDescription}
      </p>
    </div>
  );
}
