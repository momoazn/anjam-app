import { useNavigate } from "react-router-dom";

export function useCreateProject() {
  const navigate = useNavigate();

  return () => {
    navigate("/projects/new");
  };
}

export function useCreateTask(projectId?: string) {
  const navigate = useNavigate();

  return () => {
    if (projectId) {
      navigate(`/projects/${projectId}/tasks/new`);
    } else {
      navigate("/tasks/new");
    }
  };
}
