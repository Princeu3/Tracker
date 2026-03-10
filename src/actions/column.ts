"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { trackerColumns, trackers } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { ColumnType, ColumnConfig } from "@/types";

export async function addColumn(
  trackerId: string,
  data: { name: string; type: ColumnType; config?: ColumnConfig }
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const tracker = await db.query.trackers.findFirst({
    where: and(eq(trackers.id, trackerId), eq(trackers.userId, session.user.id)),
  });
  if (!tracker) throw new Error("Tracker not found");

  const maxOrder = await db
    .select({
      max: sql<number>`COALESCE(MAX(${trackerColumns.order}), -1)`,
    })
    .from(trackerColumns)
    .where(eq(trackerColumns.trackerId, trackerId));

  const [column] = await db
    .insert(trackerColumns)
    .values({
      trackerId,
      name: data.name,
      type: data.type,
      order: (maxOrder[0]?.max ?? -1) + 1,
      config: data.config || {},
    })
    .returning();

  revalidatePath(`/tracker/${trackerId}`);
  return column;
}

export async function updateColumn(
  columnId: string,
  data: { name?: string; type?: ColumnType; config?: ColumnConfig }
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const column = await db.query.trackerColumns.findFirst({
    where: eq(trackerColumns.id, columnId),
    with: { tracker: true },
  });
  if (!column || column.tracker.userId !== session.user.id) {
    throw new Error("Column not found");
  }

  await db
    .update(trackerColumns)
    .set(data)
    .where(eq(trackerColumns.id, columnId));

  revalidatePath(`/tracker/${column.trackerId}`);
}

export async function deleteColumn(columnId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const column = await db.query.trackerColumns.findFirst({
    where: eq(trackerColumns.id, columnId),
    with: { tracker: true },
  });
  if (!column || column.tracker.userId !== session.user.id) {
    throw new Error("Column not found");
  }

  await db.delete(trackerColumns).where(eq(trackerColumns.id, columnId));
  revalidatePath(`/tracker/${column.trackerId}`);
}

export async function reorderColumns(
  trackerId: string,
  columnIds: string[]
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await Promise.all(
    columnIds.map((id, index) =>
      db
        .update(trackerColumns)
        .set({ order: index })
        .where(eq(trackerColumns.id, id))
    )
  );

  revalidatePath(`/tracker/${trackerId}`);
}

export async function getColumns(trackerId: string) {
  return db.query.trackerColumns.findMany({
    where: eq(trackerColumns.trackerId, trackerId),
    orderBy: (columns, { asc }) => [asc(columns.order)],
  });
}
