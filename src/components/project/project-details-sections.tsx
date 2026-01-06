import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  IconCalendar,
  IconFileText,
  IconHistory,
  IconQuote,
  IconTerminal,
  IconUser,
} from "@tabler/icons-react";

import { Textarea } from "@/components/ui/textarea";
import { projects } from "@/constants";
import { formatDateLocale } from "@/lib/date-utils";
import { stripHtml } from "@/lib/excel-export";
import { cn, formatUserName } from "@/lib/utils";
import { useCurrentOrgMode } from "@/store/auth-store";

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
  const mode = useCurrentOrgMode();
  const isProductMode = mode === "product";
  const supervisor = project.supervisor;

  return (
    <div
      className={cn(
        "lg:col-span-2",
        isProductMode ? "space-y-8" : "space-y-16",
      )}
    >
      {/* Identity Log Module */}
      <section className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="text-muted-foreground flex items-center gap-2 text-xs font-semibold">
            <IconTerminal className="size-4 opacity-70" />
            <span>{projects.details.information}</span>
          </div>
        </div>

        {isProductMode ? (
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
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {[
              {
                label: projects.details.supervisor,
                value: supervisor ? (
                  formatUserName(
                    supervisor.firstName,
                    supervisor.lastName,
                    supervisor.username,
                  )
                ) : (
                  <span className="text-muted-foreground/40">—</span>
                ),
                icon: IconUser,
              },
              {
                label: projects.details.createdAt,
                value: project._creationTime
                  ? digitsEnToFa(formatDateLocale(project._creationTime))
                  : "—",
                icon: IconCalendar,
              },
              {
                label: "شناسه_سیستمی",
                value: project._id,
                icon: IconTerminal,
                mono: true,
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
            ].map((item, i) => (
              <div
                key={i}
                className="group border-border/40 bg-card hover:border-primary/40 relative overflow-hidden rounded-2xl border p-6 transition-colors"
              >
                <div className="relative z-10 flex h-full flex-col justify-between gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground/40 text-[10px] font-bold tracking-tight">
                      {item.label}
                    </span>
                    <item.icon className="text-primary/40 group-hover:text-primary size-4 transition-colors" />
                  </div>
                  <div
                    className={cn(
                      "text-right text-sm font-bold tracking-tight",
                      item.mono && "font-mono text-[10px] opacity-60",
                    )}
                  >
                    {item.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Description Section */}
      <section className="space-y-6">
        <div className="text-muted-foreground flex items-center gap-2 text-xs font-semibold">
          <IconFileText className="size-4 opacity-70" />
          <span>{projects.details.description}</span>
        </div>

        <div className="relative">
          {isEditing ? (
            <div
              className={cn(
                "relative overflow-hidden border border-border/40 bg-background/30",
                isProductMode
                  ? "rounded-xl p-4"
                  : "border-primary/20 bg-card rounded-2xl p-8",
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
                    "border-border/40 bg-background focus:border-primary/40 rounded-xl border text-right font-medium leading-relaxed focus:ring-0",
                    isProductMode
                      ? "min-h-36 p-4 text-sm"
                      : "min-h-48 p-6 text-lg",
                  )}
                />
              </div>
            </div>
          ) : project.description ? (
            isProductMode ? (
              <div className="overflow-hidden rounded-xl border border-border/40 bg-background/30 p-4">
                <p className="text-foreground/80 whitespace-pre-wrap text-right text-sm leading-relaxed font-medium">
                  {stripHtml(project.description)}
                </p>
              </div>
            ) : (
              <div className="border-border/40 bg-card relative overflow-hidden rounded-2xl border p-12">
                <div className="bg-primary text-primary-foreground absolute -top-4 -right-4 z-10 flex size-12 items-center justify-center rounded-2xl">
                  <IconQuote className="size-6" />
                </div>
                <p className="text-foreground/80 relative z-10 text-right text-xl leading-relaxed font-medium whitespace-pre-wrap">
                  {stripHtml(project.description)}
                </p>
              </div>
            )
          ) : (
            <div
              className={cn(
                "border-border/20 bg-muted/5 relative overflow-hidden border border-dashed text-center opacity-30 grayscale",
                isProductMode ? "rounded-xl p-10" : "rounded-2xl p-20",
              )}
            >
              <IconFileText
                className={cn(
                  "text-primary mx-auto mb-6 stroke-1",
                  isProductMode ? "size-10" : "size-16",
                )}
              />
              <p className="text-xs font-bold tracking-tight">
                {projects.details.noDescription}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Assets and Activity Stream are disabled/hidden during migration as per plan */}
    </div>
  );
}
