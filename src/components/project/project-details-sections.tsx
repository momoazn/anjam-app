import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  IconActivity,
  IconCalendar,
  IconFileText,
  IconHistory,
  IconQuote,
  IconTerminal,
  IconTrash,
  IconUpload,
  IconUser,
} from "@tabler/icons-react";

import { ActivityStream } from "@/components/audit/activity-stream";
import { ProjectAssets } from "@/components/project/project-assets";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Textarea } from "@/components/ui/textarea";
import { auditLogs, projects } from "@/constants";
import type { FileWithPreview } from "@/hooks/use-file-upload";
import { formatDateLocale } from "@/lib/date-utils";
import { stripHtml } from "@/lib/excel-export";
import type { ProjectWithSupervisor } from "@/lib/pocketbase";
import { cn, formatUserName } from "@/lib/utils";
import { useCurrentOrgMode } from "@/store/auth-store";

type ProjectDetailsSectionsProps = {
  project: ProjectWithSupervisor;
  isEditing: boolean;
  editedDescription: string;
  filesToDelete: string[];
  newFiles: FileWithPreview[];
  onDescriptionChange: (value: string) => void;
  onNewFilesChange: (files: FileWithPreview[]) => void;
  onDeleteFile: (filename: string) => void;
};

export function ProjectDetailsSections({
  project,
  isEditing,
  editedDescription,
  filesToDelete,
  newFiles,
  onDescriptionChange,
  onNewFilesChange,
  onDeleteFile,
}: ProjectDetailsSectionsProps) {
  const mode = useCurrentOrgMode();
  const isProductMode = mode === "product";
  const supervisor = project.expand?.supervisor;

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
                      supervisor.first_name,
                      supervisor.last_name,
                      supervisor.username,
                    )
                  : "—",
                icon: IconUser,
                muted: !supervisor,
              },
              {
                label: projects.details.createdAt,
                value: digitsEnToFa(formatDateLocale(project.created)),
                icon: IconCalendar,
              },
              {
                label: projects.details.updatedAt,
                value: digitsEnToFa(formatDateLocale(project.updated)),
                icon: IconHistory,
              },
              {
                label: "شناسه",
                value: project.id,
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
                    supervisor.first_name,
                    supervisor.last_name,
                    supervisor.username,
                  )
                ) : (
                  <span className="text-muted-foreground/40">—</span>
                ),
                icon: IconUser,
              },
              {
                label: projects.details.createdAt,
                value: digitsEnToFa(formatDateLocale(project.created)),
                icon: IconCalendar,
              },
              {
                label: "شناسه_سیستمی",
                value: project.id,
                icon: IconTerminal,
                mono: true,
              },
              {
                label: projects.details.updatedAt,
                value: digitsEnToFa(formatDateLocale(project.updated)),
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
                  value={editedDescription.replace(/<br>/g, "\n")}
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

      {/* Asset Section */}
      <section className="space-y-6">
        <div className="text-muted-foreground flex items-center gap-2 text-xs font-semibold">
          <IconUpload className="size-4 opacity-70" />
          <span>{projects.details.files}</span>
        </div>

        <div
          className={cn(
            "border-border/40 relative overflow-hidden border",
            isProductMode
              ? "rounded-xl bg-background/30"
              : "bg-card rounded-2xl",
          )}
        >
          <div className="relative z-10">
            {isEditing ? (
              <div
                className={cn(
                  "space-y-10 text-right",
                  isProductMode ? "p-4" : "space-y-12 p-8 md:p-12",
                )}
              >
                {project.assets && project.assets.length > 0 && (
                  <div className="space-y-6">
                    <h4 className="text-muted-foreground/40 border-border/10 border-b pb-3 text-[10px] font-bold tracking-tight">
                      {projects.files.existingFiles}
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {project.assets
                        .filter((filename) => !filesToDelete.includes(filename))
                        .map((filename) => (
                          <div
                            key={filename}
                            className="group border-border/20 bg-background/50 flex items-center justify-between rounded-xl border p-4 transition-all hover:border-rose-500/40"
                          >
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => onDeleteFile(filename)}
                              className="h-10 w-10 shrink-0 rounded-lg text-rose-500 hover:bg-rose-500 hover:text-white"
                            >
                              <IconTrash className="size-5" />
                            </Button>
                            <span className="flex-1 truncate pe-6 text-right font-mono text-xs font-bold tracking-tight opacity-60">
                              {filename}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <h4 className="text-primary border-primary/20 flex items-center justify-end gap-3 border-b pb-3 text-[10px] font-bold tracking-tight">
                    {projects.files.addNewFiles}
                    <IconUpload className="size-4" />
                  </h4>
                  <FileUpload
                    value={newFiles}
                    onChange={onNewFilesChange}
                    maxSize={52428800}
                  />
                </div>
              </div>
            ) : (
              <ProjectAssets project={project} />
            )}
          </div>
        </div>
      </section>

      {/* Operation Log Section */}
      {isProductMode ? null : (
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-lg">
              <IconActivity className="size-4" />
            </div>
            <span className="text-primary text-[10px] font-bold tracking-tight">
              {auditLogs.activityStream.title}
            </span>
            <div className="bg-border/20 h-px flex-1" />
          </div>

          <div className="border-border/40 bg-card relative overflow-hidden rounded-2xl border">
            <div className="relative z-10">
              <ActivityStream resource="projects" resourceId={project.id} />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
