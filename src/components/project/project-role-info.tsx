import { Badge } from "@/components/ui/badge";

const roleDescriptions: Record<string, string> = {
  owner: "مدیریت کامل پروژه و اعضا",
  admin: "مدیریت اعضا و تنظیمات پروژه",
  member: "دسترسی کامل به تسک‌ها",
  viewer: "دسترسی فقط خواندنی",
};

const roleLabels: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
  viewer: "Viewer",
};

type ProjectRoleInfoProps = {
  role: "owner" | "admin" | "member" | "viewer";
};

export function ProjectRoleInfo({ role }: ProjectRoleInfoProps) {
  return (
    <div className="bg-muted/5 border-border/40 flex items-center justify-between gap-4 border p-3">
      <div className="text-muted-foreground text-[10px] font-black tracking-tight uppercase">
        {roleLabels[role]}
      </div>
      <Badge
        variant="outline"
        className="border-border/40 bg-muted/30 text-muted-foreground rounded-none text-[9px] font-black tracking-tight uppercase"
      >
        {roleLabels[role]}
      </Badge>
      <span className="text-muted-foreground/70 text-xs font-medium">
        {roleDescriptions[role]}
      </span>
    </div>
  );
}
