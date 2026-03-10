import { getTrackers } from "@/actions/tracker";
import { TrackerGrid } from "@/components/dashboard/tracker-grid";

export default async function DashboardPage() {
  const trackers = await getTrackers();

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Your trackers at a glance</p>
      </div>
      <TrackerGrid trackers={trackers} />
    </div>
  );
}
