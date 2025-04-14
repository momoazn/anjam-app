import { useParams } from "react-router-dom";

export function ProjectTasks() {
  const { id: projectId } = useParams<{ id: string }>();

  if (!projectId) {
    return <div>No project ID</div>;
  }

  return <div>ProjectTasks</div>;
}
