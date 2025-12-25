import { Subtasks } from "@/components/task/subtasks";
import type { TaskWithProject } from "@/lib/pocketbase";

type TaskSubtasksSectionProps = {
  task: TaskWithProject;
};

export function TaskSubtasksSection({ task }: TaskSubtasksSectionProps) {
  return <Subtasks taskId={task.id} projectId={task.project} />;
}
