"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { trackers, trackerColumns, trackerRows } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { SchemaColumn } from "@/types";

export async function createTracker(data: {
  name: string;
  description?: string;
  icon?: string;
  columns: SchemaColumn[];
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const [tracker] = await db
    .insert(trackers)
    .values({
      userId: session.user.id,
      name: data.name,
      description: data.description,
      icon: data.icon,
    })
    .returning();

  if (data.columns.length > 0) {
    await db.insert(trackerColumns).values(
      data.columns.map((col, index) => ({
        trackerId: tracker.id,
        name: col.name,
        type: col.type,
        order: index,
        config: col.config || {},
        required: col.required || false,
      }))
    );
  }

  revalidatePath("/dashboard");
  return tracker;
}

export async function getTrackers() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return db.query.trackers.findMany({
    where: eq(trackers.userId, session.user.id),
    orderBy: (trackers, { desc }) => [desc(trackers.updatedAt)],
  });
}

export async function getTracker(trackerId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const tracker = await db.query.trackers.findFirst({
    where: and(eq(trackers.id, trackerId), eq(trackers.userId, session.user.id)),
    with: {
      columns: {
        orderBy: (columns, { asc }) => [asc(columns.order)],
      },
      rows: {
        orderBy: (rows, { asc }) => [asc(rows.order)],
      },
      attachments: true,
    },
  });

  return tracker;
}

export async function updateTracker(
  trackerId: string,
  data: { name?: string; description?: string; icon?: string }
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db
    .update(trackers)
    .set({ ...data, updatedAt: new Date() })
    .where(
      and(eq(trackers.id, trackerId), eq(trackers.userId, session.user.id))
    );

  revalidatePath(`/tracker/${trackerId}`);
  revalidatePath("/dashboard");
}

export async function deleteTracker(trackerId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db
    .delete(trackers)
    .where(
      and(eq(trackers.id, trackerId), eq(trackers.userId, session.user.id))
    );

  revalidatePath("/dashboard");
}
