import { ChevronLeft, Target, Hash } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboard } from "@/constants";
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
      <div className="mb-10">
        <Skeleton className="mb-6 h-8 w-48 rounded-sm" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {["ske-proj-1", "ske-proj-2", "ske-proj-3"].map((key) => (
            <Card key={key} className="border-border/50 rounded-sm">
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="mb-3 h-3 w-full rounded-none" />
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
    <div className="mb-10" data-animate-stagger>
      <div className="mb-6 flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-sm">
            <Target className="size-4" />
          </div>
          <h2 className="text-xl font-black tracking-tight uppercase">
            {dashboard.projectSummary}
          </h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/projects")}
          className="text-muted-foreground hover:text-primary gap-2 font-bold tracking-widest uppercase"
        >
          {dashboard.cards.viewAll}
          <ChevronLeft className="size-4" />
        </Button>
      </div>

      <div
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        data-animate-stagger
      >
        {projects.slice(0, 6).map((project) => (
          <button
            key={project.id}
            type="button"
            className="group border-border/50 bg-card hover:shadow-primary/5 relative flex flex-col overflow-hidden rounded-sm border text-right transition-all duration-300 hover:translate-y-[-4px] hover:shadow-2xl active:scale-[0.98]"
            onClick={() => navigate(`/projects/${project.id}/details`)}
          >
            <CardHeader className="bg-muted/20 border-b p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-black tracking-tight">
                  {project.name}
                </CardTitle>
                <Badge variant="secondary" className="rounded-sm font-black">
                  {digitsEnToFa(project.taskCount)} ITEMS
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-4">
                <div className="mb-2 flex items-end justify-between">
                  <div>
                    <span className="text-muted-foreground/50 text-[10px] font-black tracking-[0.2em] uppercase">
                      {dashboard.cards.progress}
                    </span>
                    <div className="mt-0.5 text-2xl font-black tracking-tighter">
                      {digitsEnToFa(project.progress)}
                      <span className="text-muted-foreground/40 ml-0.5 text-sm">
                        %
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground/50 text-[10px] font-black tracking-[0.2em] uppercase">
                      Completed
                    </span>
                    <div className="mt-0.5 text-sm font-bold">
                      {digitsEnToFa(project.completedTasks)}{" "}
                      <span className="text-muted-foreground/30">/</span>{" "}
                      {digitsEnToFa(project.taskCount)}
                    </div>
                  </div>
                </div>

                <div className="bg-muted/60 relative h-2 w-full overflow-hidden rounded-none">
                  <div
                    className="bg-primary absolute inset-y-0 left-0 transition-all duration-1000 ease-out"
                    style={{ width: `${project.progress}%` }}
                  >
                    <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  </div>
                </div>
              </div>

              <div className="border-border/40 flex items-center gap-2 border-t pt-4 opacity-40 transition-opacity group-hover:opacity-100">
                <Hash className="text-muted-foreground size-3" />
                <span className="text-muted-foreground text-[9px] font-black tracking-widest uppercase">
                  PRJ-{project.id.slice(0, 4).toUpperCase()}
                </span>
              </div>
            </CardContent>

            {/* Visual Hover Decoration */}
            <div className="bg-primary absolute right-0 bottom-0 h-1 w-0 transition-all duration-500 group-hover:w-full" />
          </button>
        ))}
      </div>
    </div>
  );
}
