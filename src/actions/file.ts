"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { attachments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { unlink } from "fs/promises";
import { join } from "path";

export async function deleteFile(fileId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const file = await db.query.attachments.findFirst({
    where: and(
      eq(attachments.id, fileId),
      eq(attachments.userId, session.user.id)
    ),
  });
  if (!file) throw new Error("File not found");

  try {
    await unlink(join(process.cwd(), file.storagePath));
  } catch {
    // File may already be deleted from disk
  }

  await db.delete(attachments).where(eq(attachments.id, fileId));

  if (file.trackerId) {
    revalidatePath(`/tracker/${file.trackerId}`);
  }
}

export async function getFiles(trackerId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return db.query.attachments.findMany({
    where: and(
      eq(attachments.trackerId, trackerId),
      eq(attachments.userId, session.user.id)
    ),
    orderBy: (attachments, { desc }) => [desc(attachments.createdAt)],
  });
}
