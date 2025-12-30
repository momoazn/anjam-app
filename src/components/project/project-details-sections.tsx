import {
  IconCalendar,
  IconFileText,
  IconHistory,
  IconTrash,
  IconUpload,
  IconUser,
  IconTerminal,
  IconQuote,
  IconActivity,
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
import { formatUserName } from "@/lib/utils";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { BlueprintPattern } from "@/components/design-system/blueprint-pattern";

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
  const supervisor = project.expand?.supervisor;

  return (
    <div className="space-y-16 lg:col-span-2">
      {/* Identity Log Module */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-lg">
            <IconTerminal className="size-4" />
          </div>
          <span className="text-primary text-[10px] font-bold tracking-tight">
            {projects.details.information}
          </span>
          <div className="bg-border/20 h-px flex-1" />
        </div>

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
              <BlueprintPattern
                variant="technical"
                className="opacity-[0.02]"
              />
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
      </section>

      {/* Description Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-lg">
            <IconFileText className="size-4" />
          </div>
          <span className="text-primary text-[10px] font-bold tracking-tight">
            {projects.details.description}
          </span>
          <div className="bg-border/20 h-px flex-1" />
        </div>

        <div className="relative">
          {isEditing ? (
            <div className="border-primary/20 bg-card relative overflow-hidden rounded-2xl border p-8">
              <BlueprintPattern
                variant="technical"
                className="opacity-[0.05]"
              />
              <div className="relative z-10 space-y-3 text-right">
                <span className="text-primary text-[10px] font-bold tracking-tight">
                  {projects.edit.description}
                </span>
                <Textarea
                  value={editedDescription.replace(/<br>/g, "\n")}
                  onChange={(event) => onDescriptionChange(event.target.value)}
                  placeholder={projects.create.form.descriptionPlaceholder}
                  className="border-border/40 bg-background focus:border-primary/40 min-h-48 rounded-xl border p-6 text-right text-lg leading-relaxed font-medium focus:ring-0"
                />
              </div>
            </div>
          ) : project.description ? (
            <div className="border-border/40 bg-card relative overflow-hidden rounded-2xl border p-12">
              <BlueprintPattern variant="cross" className="opacity-[0.03]" />
              <div className="bg-primary text-primary-foreground absolute -top-4 -right-4 z-10 flex size-12 items-center justify-center rounded-2xl">
                <IconQuote className="size-6" />
              </div>
              <p className="text-foreground/80 relative z-10 text-right text-xl leading-relaxed font-medium whitespace-pre-wrap">
                {stripHtml(project.description)}
              </p>
            </div>
          ) : (
            <div className="border-border/20 bg-muted/5 relative overflow-hidden rounded-2xl border border-dashed p-20 text-center opacity-30 grayscale">
              <IconFileText className="text-primary mx-auto mb-6 size-16 stroke-1" />
              <p className="text-xs font-bold tracking-tight">
                {projects.details.noDescription}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Asset Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-lg">
            <IconUpload className="size-4" />
          </div>
          <span className="text-primary text-[10px] font-bold tracking-tight">
            {projects.details.files}
          </span>
          <div className="bg-border/20 h-px flex-1" />
        </div>

        <div className="border-border/40 bg-card relative overflow-hidden rounded-2xl border">
          <BlueprintPattern variant="technical" className="opacity-[0.02]" />
          <div className="relative z-10">
            {isEditing ? (
              <div className="space-y-12 p-8 text-right md:p-12">
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
          <BlueprintPattern variant="technical" className="opacity-[0.02]" />
          <div className="relative z-10">
            <ActivityStream resource="projects" resourceId={project.id} />
          </div>
        </div>
      </section>
    </div>
  );
}

import { cn } from "@/lib/utils";
