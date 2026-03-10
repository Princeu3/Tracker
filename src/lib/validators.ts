import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const createTrackerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  icon: z.string().optional(),
  columns: z.array(
    z.object({
      name: z.string().min(1),
      type: z.enum([
        "text",
        "number",
        "date",
        "select",
        "multi_select",
        "checkbox",
        "url",
        "email",
        "currency",
        "file",
      ]),
      required: z.boolean().optional(),
      config: z.record(z.string(), z.unknown()).optional(),
    })
  ),
});

export const updateCellSchema = z.object({
  rowId: z.string(),
  columnId: z.string(),
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.string()),
    z.null(),
  ]),
});
