import { getTracker } from "@/actions/tracker";
import { DataTable } from "@/components/tracker/data-table";
import { notFound } from "next/navigation";

export default async function TrackerPage({
  params,
}: {
  params: Promise<{ trackerId: string }>;
}) {
  const { trackerId } = await params;
  const tracker = await getTracker(trackerId);

  if (!tracker) notFound();

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{tracker.name}</h1>
        {tracker.description && (
          <p className="text-muted-foreground">{tracker.description}</p>
        )}
      </div>
      <DataTable
        trackerId={tracker.id}
        columns={tracker.columns}
        rows={tracker.rows}
        attachments={tracker.attachments ?? []}
      />
    </div>
  );
}
