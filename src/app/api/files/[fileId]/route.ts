import { auth } from "@/auth";
import { db } from "@/db";
import { attachments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fileId } = await params;

  const file = await db.query.attachments.findFirst({
    where: and(
      eq(attachments.id, fileId),
      eq(attachments.userId, session.user.id)
    ),
  });

  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const fullPath = join(process.cwd(), file.storagePath);

  try {
    const buffer = await readFile(fullPath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": file.fileType,
        "Content-Disposition": `inline; filename="${file.fileName}"`,
        "Content-Length": file.fileSize.toString(),
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found on disk" }, { status: 404 });
  }
}
