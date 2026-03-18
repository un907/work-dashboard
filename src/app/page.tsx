import { getTasks, getSessionLogs, getSnapshots } from "@/lib/sheets";
import { DashboardContent } from "@/components/dashboard-content";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [tasks, sessions, snapshots] = await Promise.all([
    getTasks().catch(() => []),
    getSessionLogs().catch(() => []),
    getSnapshots().catch(() => []),
  ]);

  return (
    <DashboardContent tasks={tasks} sessions={sessions} snapshots={snapshots} />
  );
}
