import { Badge } from "@/components/ui/badge";
import { projectRoles } from "@/constants/misc";

type ProjectRoleInfoProps = {
  role: "owner" | "admin" | "member" | "viewer";
};

export function ProjectRoleInfo({ role }: ProjectRoleInfoProps) {
  return (
    <div className="bg-muted/5 border-border/40 flex items-center justify-between gap-4 rounded-xl border p-3">
      <div className="text-muted-foreground text-[10px] font-bold tracking-tight">
        {projectRoles.labels[role]}
      </div>
      <Badge
        variant="outline"
        className="border-border/40 bg-muted/30 text-muted-foreground rounded-lg text-[9px] font-bold tracking-tight"
      >
        {projectRoles.labels[role]}
      </Badge>
      <span className="text-muted-foreground/70 text-xs font-medium">
        {projectRoles.descriptions[role]}
      </span>
    </div>
  );
}
