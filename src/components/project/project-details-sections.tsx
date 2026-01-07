import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  IconCalendar,
  IconFileText,
  IconHistory,
  IconTerminal,
  IconUser,
} from "@tabler/icons-react";

import { Textarea } from "@/components/ui/textarea";
import { projects } from "@/constants";
import { formatDateLocale } from "@/lib/date-utils";
import { stripHtml } from "@/lib/excel-export";
import { cn, formatUserName } from "@/lib/utils";

type ProjectDetailsSectionsProps = {
  project: {
    _id: string;
    _creationTime: number;
    name: string;
    code: string;
    description?: string;
    updatedAt?: number;
    supervisor?: {
      firstName?: string;
      lastName?: string;
      username?: string;
    } | null;
  };
  isEditing: boolean;
  editedDescription: string;
  onDescriptionChange: (value: string) => void;
};

export function ProjectDetailsSections({
  project,
  isEditing,
  editedDescription,
  onDescriptionChange,
}: ProjectDetailsSectionsProps) {
  const supervisor = project.supervisor;

  return (
    <div className="lg:col-span-2 space-y-8">
      <section className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="text-muted-foreground flex items-center gap-2 text-xs font-semibold">
            <IconTerminal className="size-4 opacity-70" />
            <span>{projects.details.information}</span>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border/40 bg-background/30">
          {[
            {
              label: projects.details.supervisor,
              value: supervisor
                ? formatUserName(
                    supervisor.firstName,
                    supervisor.lastName,
                    supervisor.username,
                  )
                : "—",
              icon: IconUser,
              muted: !supervisor,
            },
            {
              label: projects.details.createdAt,
              value: project._creationTime
                ? digitsEnToFa(formatDateLocale(project._creationTime))
                : "—",
              icon: IconCalendar,
            },
            {
              label: projects.details.updatedAt,
              value: project.updatedAt
                ? digitsEnToFa(formatDateLocale(project.updatedAt))
                : project._creationTime
                  ? digitsEnToFa(formatDateLocale(project._creationTime))
                  : "—",
              icon: IconHistory,
            },
            {
              label: "شناسه",
              value: project._id,
              icon: IconTerminal,
              mono: true,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-3 border-b border-border/40 px-4 py-3 last:border-b-0"
            >
              <div className="text-muted-foreground flex items-center gap-2 text-xs font-semibold">
                <item.icon className="size-4 opacity-70" />
                <span>{item.label}</span>
              </div>
              <div
                className={cn(
                  "text-right text-sm font-semibold",
                  item.muted && "text-muted-foreground/60",
                  item.mono && "font-mono text-xs opacity-70",
                )}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="text-muted-foreground flex items-center gap-2 text-xs font-semibold">
          <IconFileText className="size-4 opacity-70" />
          <span>{projects.details.description}</span>
        </div>

        <div className="relative">
          {isEditing ? (
            <div
              className={cn(
                "relative overflow-hidden border border-border/40 bg-background/30 rounded-xl p-4",
              )}
            >
              <div className="relative z-10 space-y-3 text-right">
                <span className="text-primary text-[10px] font-bold tracking-tight">
                  {projects.edit.description}
                </span>
                <Textarea
                  value={editedDescription}
                  onChange={(event) => onDescriptionChange(event.target.value)}
                  placeholder={projects.create.form.descriptionPlaceholder}
                  className={cn(
                    "border-border/40 bg-background focus:border-primary/40 rounded-xl border text-right font-medium leading-relaxed focus:ring-0 min-h-36 p-4 text-sm",
                  )}
                />
              </div>
            </div>
          ) : project.description ? (
            <div className="overflow-hidden rounded-xl border border-border/40 bg-background/30 p-4">
              <p className="text-foreground/80 whitespace-pre-wrap text-right text-sm leading-relaxed font-medium">
                {stripHtml(project.description)}
              </p>
            </div>
          ) : (
            <div
              className={cn(
                "border-border/20 bg-muted/5 relative overflow-hidden border border-dashed text-center opacity-30 grayscale rounded-xl p-10",
              )}
            >
              <IconFileText
                className={cn("text-primary mx-auto mb-6 stroke-1 size-10")}
              />
              <p className="text-xs font-bold tracking-tight">
                {projects.details.noDescription}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
