import { getTracker } from "@/actions/tracker";
import { DataTable } from "@/components/tracker/data-table";
import { EditableTitle } from "@/components/tracker/editable-title";
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
    <div className="h-full overflow-auto p-6 animate-fade-in">
      <EditableTitle
        trackerId={tracker.id}
        initialName={tracker.name}
        initialDescription={tracker.description}
      />
      <DataTable
        trackerId={tracker.id}
        columns={tracker.columns}
        rows={tracker.rows}
        attachments={tracker.attachments ?? []}
      />
    </div>
  );
}
