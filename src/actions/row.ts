"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { trackerRows, trackers } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { CellValue } from "@/types";

export async function addRow(trackerId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const tracker = await db.query.trackers.findFirst({
    where: and(eq(trackers.id, trackerId), eq(trackers.userId, session.user.id)),
  });
  if (!tracker) throw new Error("Tracker not found");

  const maxOrder = await db
    .select({ max: sql<number>`COALESCE(MAX(${trackerRows.order}), -1)` })
    .from(trackerRows)
    .where(eq(trackerRows.trackerId, trackerId));

  const [row] = await db
    .insert(trackerRows)
    .values({
      trackerId,
      data: {},
      order: (maxOrder[0]?.max ?? -1) + 1,
    })
    .returning();

  revalidatePath(`/tracker/${trackerId}`);
  return row;
}

export async function updateCell(
  rowId: string,
  columnId: string,
  value: CellValue
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const row = await db.query.trackerRows.findFirst({
    where: eq(trackerRows.id, rowId),
    with: { tracker: true },
  });
  if (!row || row.tracker.userId !== session.user.id) {
    throw new Error("Row not found");
  }

  const newData = { ...row.data, [columnId]: value };
  await db
    .update(trackerRows)
    .set({ data: newData, updatedAt: new Date() })
    .where(eq(trackerRows.id, rowId));

  revalidatePath(`/tracker/${row.trackerId}`);
  return newData;
}

export async function deleteRow(rowId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const row = await db.query.trackerRows.findFirst({
    where: eq(trackerRows.id, rowId),
    with: { tracker: true },
  });
  if (!row || row.tracker.userId !== session.user.id) {
    throw new Error("Row not found");
  }

  await db.delete(trackerRows).where(eq(trackerRows.id, rowId));
  revalidatePath(`/tracker/${row.trackerId}`);
}

export async function getRows(trackerId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return db.query.trackerRows.findMany({
    where: eq(trackerRows.trackerId, trackerId),
    orderBy: (rows, { asc }) => [asc(rows.order)],
  });
}
