import { getTasks } from "@/lib/sheets";
import { TasksContent } from "@/components/tasks-content";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const tasks = await getTasks().catch(() => []);
  return <TasksContent tasks={tasks} />;
}
