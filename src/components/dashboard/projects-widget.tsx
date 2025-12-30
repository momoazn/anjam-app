import { ChevronLeft, Target, Hash } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboard, reports } from "@/constants";
import { digitsEnToFa } from "@persian-tools/persian-tools";

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

export function ProjectsWidget({
  projects = [],
  isLoading = false,
}: ProjectsWidgetProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="mb-12">
        <Skeleton className="mb-8 h-10 w-64 rounded-md" />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {["ske-proj-1", "ske-proj-2", "ske-proj-3"].map((key) => (
            <Card key={key} className="border-border/40">
              <CardHeader className="pb-4">
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="mb-4 h-4 w-full rounded-md" />
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-20" />
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
      <div className="mb-6 flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-md">
            <Target className="size-4" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            {dashboard.projectSummary}
          </h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/projects")}
          className="text-muted-foreground hover:text-primary h-8 gap-2 px-3 text-xs font-semibold transition-all"
        >
          {dashboard.cards.viewAll}
          <ChevronLeft className="size-3.5 transition-transform group-hover:translate-x-[-4px]" />
        </Button>
      </div>

      <div
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        data-animate-stagger
      >
        {projects.slice(0, 6).map((project, idx) => (
          <Card
            key={project.id}
            className="group border-border/40 bg-card/50 hover:bg-card hover:border-primary/40 relative flex h-auto cursor-pointer flex-col overflow-hidden transition-all duration-300 hover:shadow-md"
            onClick={() => navigate(`/projects/${project.id}/details`)}
          >
            <CardHeader className="border-border/40 relative z-10 border-b p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground/60 text-[10px] font-bold tracking-tight">
                    {dashboard.project} {digitsEnToFa(idx + 1)}
                  </span>
                  <CardTitle className="text-lg font-bold tracking-tight">
                    {project.name}
                  </CardTitle>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-none px-2 py-0.5 text-[10px] font-semibold"
                >
                  {digitsEnToFa(project.taskCount)} {dashboard.chart.count}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="relative z-10 p-6 text-right">
              <div className="mb-4">
                <div className="mb-3 flex items-end justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground/60 text-[10px] font-bold tracking-tight">
                      {dashboard.cards.progress}
                    </span>
                    <div className="text-2xl font-bold tracking-tight">
                      {digitsEnToFa(project.progress)}
                      <span className="text-muted-foreground/40 ms-1 text-xs">
                        %
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-muted-foreground/60 text-[10px] font-bold tracking-tight">
                      {reports.completed}
                    </span>
                    <div className="text-xs font-semibold tracking-tight">
                      {digitsEnToFa(project.completedTasks)}{" "}
                      <span className="text-muted-foreground/40 mx-1">/</span>{" "}
                      {digitsEnToFa(project.taskCount)}
                    </div>
                  </div>
                </div>

                <div className="bg-muted/40 relative h-2 w-full overflow-hidden rounded-full">
                  <div
                    className="bg-primary absolute inset-y-0 start-0 transition-all duration-1000 ease-out"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              <div className="border-border/40 flex items-center justify-between border-t pt-4">
                <div className="flex items-center gap-1.5">
                  <Hash className="text-primary size-2.5" />
                  <span className="text-muted-foreground text-[10px] font-medium">
                    PRJ-{project.id.slice(0, 4).toUpperCase()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
