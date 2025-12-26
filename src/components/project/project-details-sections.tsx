import {
  IconCalendar,
  IconFileText,
  IconHistory,
  IconTrash,
  IconUpload,
  IconUser,
  IconTerminal,
} from "@tabler/icons-react";

import { ActivityStream } from "@/components/audit/activity-stream";
import { ProjectAssets } from "@/components/project/project-assets";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Textarea } from "@/components/ui/textarea";
import { projects } from "@/constants";
import type { FileWithPreview } from "@/hooks/use-file-upload";
import { formatDateLocale } from "@/lib/date-utils";
import { stripHtml } from "@/lib/excel-export";
import type { ProjectWithSupervisor } from "@/lib/pocketbase";
import { formatUserName } from "@/lib/utils";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { Card, CardContent } from "@/components/ui/card";

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
    <div className="space-y-10 lg:col-span-2">
      {/* Identity Log Module */}
      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-primary/60 text-[10px] font-black tracking-tight uppercase">
            01_Identity_Log
          </span>
          <div className="bg-border/20 h-px flex-1" />
        </div>

        <Card className="border-border/40 overflow-hidden rounded-none shadow-sm">
          <CardContent className="bg-border/40 grid grid-cols-1 gap-px p-0 sm:grid-cols-2">
            <div className="bg-card border-border/10 flex h-24 flex-col justify-between border-s p-6 text-right">
              <div className="flex items-center justify-end gap-2 opacity-40">
                <span className="text-[8px] font-black tracking-tight uppercase">
                  Supervisor_ID
                </span>
                <IconUser className="size-3" />
              </div>
              <div className="text-sm font-black tracking-tight uppercase">
                {supervisor ? (
                  formatUserName(
                    supervisor.first_name,
                    supervisor.last_name,
                    supervisor.username,
                  )
                ) : (
                  <span className="text-muted-foreground/40">—</span>
                )}
              </div>
            </div>

            <div className="bg-card flex h-24 flex-col justify-between p-6 text-right">
              <div className="flex items-center justify-end gap-2 opacity-40">
                <span className="text-[8px] font-black tracking-tight uppercase">
                  Temporal_Start
                </span>
                <IconCalendar className="size-3" />
              </div>
              <div className="text-sm font-black tabular-nums">
                {digitsEnToFa(formatDateLocale(project.created))}
              </div>
            </div>

            <div className="bg-card border-border/10 flex h-24 flex-col justify-between border-s p-6 text-right">
              <div className="flex items-center justify-end gap-2 opacity-40">
                <span className="text-[8px] font-black tracking-tight uppercase">
                  Internal_Hash
                </span>
                <IconTerminal className="size-3" />
              </div>
              <div className="font-mono text-xs font-black tracking-tight uppercase opacity-60">
                {project.id}
              </div>
            </div>

            <div className="bg-card flex h-24 flex-col justify-between p-6 text-right">
              <div className="flex items-center justify-end gap-2 opacity-40">
                <span className="text-[8px] font-black tracking-tight uppercase">
                  Latest_Sync
                </span>
                <IconHistory className="size-3" />
              </div>
              <div className="text-sm font-black tabular-nums">
                {digitsEnToFa(formatDateLocale(project.updated))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Description  Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-primary/60 text-[10px] font-black tracking-tight uppercase">
            02_Project_Brief
          </span>
          <div className="bg-border/20 h-px flex-1" />
        </div>

        <Card className="border-border/40 overflow-hidden rounded-none shadow-sm">
          <CardContent className="bg-muted/5 p-8">
            {isEditing ? (
              <div className="space-y-2 text-right">
                <span className="text-muted-foreground/40 text-[8px] font-black tracking-tight uppercase">
                  Input_Buffer
                </span>
                <Textarea
                  value={editedDescription.replace(/<br>/g, "\n")}
                  onChange={(event) => onDescriptionChange(event.target.value)}
                  placeholder={projects.create.form.descriptionPlaceholder}
                  className="border-border/40 bg-muted/5 focus:border-primary/40 min-h-32 rounded-none text-right leading-relaxed font-medium focus:ring-0"
                />
              </div>
            ) : project.description ? (
              <div className="prose prose-sm max-w-none text-right">
                <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap opacity-80">
                  {stripHtml(project.description)}
                </p>
              </div>
            ) : (
              <div className="py-12 text-center opacity-20 grayscale">
                <IconFileText className="mx-auto mb-4 size-10 stroke-1" />
                <p className="text-[10px] font-black tracking-tight uppercase">
                  {projects.details.noDescription}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Asset  Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-primary/60 text-[10px] font-black tracking-tight uppercase">
            03_Asset_Stream
          </span>
          <div className="bg-border/20 h-px flex-1" />
        </div>

        <Card className="border-border/40 overflow-hidden rounded-none shadow-sm">
          <CardContent className="p-0">
            {isEditing ? (
              <div className="space-y-10 p-8 text-right">
                {project.assets && project.assets.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-muted-foreground/60 border-border/10 border-b pb-2 text-[10px] font-black tracking-tight uppercase">
                      {projects.files.existingFiles}
                    </h4>
                    <div className="bg-border/40 border-border/40 grid grid-cols-1 gap-px overflow-hidden border shadow-sm">
                      {project.assets
                        .filter((filename) => !filesToDelete.includes(filename))
                        .map((filename) => (
                          <div
                            key={filename}
                            className="bg-card hover:bg-muted/30 group flex items-center justify-between p-4 transition-all"
                          >
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => onDeleteFile(filename)}
                              className="h-8 w-8 shrink-0 rounded-none text-rose-500 hover:bg-rose-500/10"
                            >
                              <IconTrash className="size-4" />
                            </Button>
                            <span className="flex-1 truncate pe-4 text-right font-mono text-xs font-bold tracking-tight uppercase opacity-60">
                              {filename}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h4 className="text-muted-foreground/60 border-border/10 flex items-center justify-end gap-2 border-b pb-2 text-[10px] font-black tracking-tight uppercase">
                    {projects.files.addNewFiles}
                    <IconUpload className="size-3.5" />
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
          </CardContent>
        </Card>
      </section>

      {/* Operation Log Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-primary/60 text-[10px] font-black tracking-tight uppercase">
            06_Operation_Log
          </span>
          <div className="bg-border/20 h-px flex-1" />
        </div>

        <Card className="border-border/40 overflow-hidden rounded-none shadow-sm">
          <CardContent className="bg-muted/5 p-0">
            <ActivityStream resource="projects" resourceId={project.id} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
