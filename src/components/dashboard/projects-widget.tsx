import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Target } from "lucide-react";
import { fa } from "@/constants";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { useNavigate } from "react-router-dom";

type Project = {
  id: string;
  name: string;
  taskCount: number;
  completedTasks: number;
  progress: number;
};

type ProjectsWidgetProps = {
  projects?: Project[];
  isLoading?: boolean;
};

export function ProjectsWidget({ projects = [], isLoading = false }: ProjectsWidgetProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="mb-8">
        <Skeleton className="mb-6 h-6 w-48" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={`project-skeleton-${i}`}>
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="mb-3 h-2 w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8" data-animate-stagger>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold md:text-xl">
          <Target className="h-4 w-4 md:h-5 md:w-5" />
          {fa.dashboard.projectSummary}
        </h2>
        <Button variant="ghost" size="sm" onClick={() => navigate("/projects")}>
          {fa.dashboard.cards.viewAll}
        </Button>
      </div>
      <div
        className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3"
        data-animate-stagger
      >
        {projects.slice(0, 6).map((project) => (
          <Card
            key={project.id}
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => navigate(`/projects/${project.id}/details`)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate(`/projects/${project.id}/details`);
              }
            }}
            tabIndex={0}
            role="button"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{project.name}</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {digitsEnToFa(project.taskCount)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-3">
                <div className="mb-1 flex justify-between text-sm">
                  <span>{fa.dashboard.cards.progress}</span>
                  <span>{digitsEnToFa(project.progress)}%</span>
                </div>
                <div className="bg-muted/60 h-2 w-full overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
              <div className="text-muted-foreground flex justify-between text-sm">
                <span>
                  {digitsEnToFa(project.completedTasks)}{" "}
                  {fa.dashboard.cards.completed}
                </span>
                <span>
                  {digitsEnToFa(project.taskCount - project.completedTasks)}{" "}
                  {fa.dashboard.cards.remaining}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
