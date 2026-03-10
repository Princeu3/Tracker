import type { GeneratedSchema } from "@/types";

const SCHEMA_START = "|||SCHEMA_START|||";
const SCHEMA_END = "|||SCHEMA_END|||";

export function parseSchemaFromResponse(
  content: string
): GeneratedSchema | null {
  const startIdx = content.indexOf(SCHEMA_START);
  const endIdx = content.indexOf(SCHEMA_END);

  if (startIdx === -1 || endIdx === -1) return null;

  const jsonStr = content.slice(startIdx + SCHEMA_START.length, endIdx).trim();

  try {
    const parsed = JSON.parse(jsonStr);
    return parsed as GeneratedSchema;
  } catch {
    return null;
  }
}

export function hasSchemaInResponse(content: string): boolean {
  return content.includes(SCHEMA_START) && content.includes(SCHEMA_END);
}
