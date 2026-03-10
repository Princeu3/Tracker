import { auth } from "@/auth";
import { db } from "@/db";
import { attachments } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { createId } from "@paralleldrive/cuid2";
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from "@/lib/constants";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const trackerId = formData.get("trackerId") as string | null;
  const rowId = formData.get("rowId") as string | null;
  const columnId = formData.get("columnId") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File too large" }, { status: 400 });
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  }

  const fileId = createId();
  const ext = file.name.split(".").pop() || "bin";
  const storagePath = `uploads/${fileId}.${ext}`;
  const fullPath = join(process.cwd(), storagePath);

  await mkdir(join(process.cwd(), "uploads"), { recursive: true });

  const bytes = await file.arrayBuffer();
  await writeFile(fullPath, Buffer.from(bytes));

  const [attachment] = await db
    .insert(attachments)
    .values({
      userId: session.user.id,
      trackerId,
      rowId,
      columnId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      storagePath,
    })
    .returning();

  return NextResponse.json(attachment);
}
