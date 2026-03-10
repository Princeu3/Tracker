"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteTracker } from "@/actions/tracker";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Table, Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { Tracker } from "@/types";

export function TrackerGrid({ trackers }: { trackers: Tracker[] }) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await deleteTracker(deleteTarget);
    toast.success("Tracker deleted");
    setDeleteTarget(null);
    setDeleting(false);
    router.refresh();
  }

  if (trackers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 animate-fade-in">
        <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5">
          <Table className="h-8 w-8 text-muted-foreground" />
          <Sparkles className="absolute -right-1 -top-1 h-5 w-5 text-primary/60" />
        </div>
        <h3 className="mb-1 text-lg font-semibold tracking-tight">No trackers yet</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Create your first tracker with AI to get started
        </p>
        <Button asChild>
          <Link href="/tracker/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Tracker
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {trackers.map((tracker, index) => (
          <Card
            key={tracker.id}
            className="group relative animate-fade-in-up transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-primary/20"
            style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
          >
            <Link href={`/tracker/${tracker.id}`} className="absolute inset-0 z-0" />
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Table className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{tracker.name}</CardTitle>
                    {tracker.description && (
                      <CardDescription className="mt-1 line-clamp-2">
                        {tracker.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative z-10 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setDeleteTarget(tracker.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Updated {tracker.updatedAt.toLocaleDateString()}
              </p>
            </CardHeader>
          </Card>
        ))}

        <Card className="flex items-center justify-center border-dashed transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-primary/20">
          <Link
            href="/tracker/new"
            className="flex flex-col items-center gap-2 p-6 text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-8 w-8" />
            <span className="text-sm font-medium">New Tracker</span>
          </Link>
        </Card>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete tracker"
        description="This action cannot be undone. This will permanently delete this tracker and all its data."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}
