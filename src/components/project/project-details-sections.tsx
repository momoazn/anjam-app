import {
  Calendar,
  FileText,
  History,
  Trash2,
  Upload,
  User,
} from "lucide-react";

import { ActivityStream } from "@/components/audit/activity-stream";
import { ProjectAssets } from "@/components/project/project-assets";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { auditLogs, projects } from "@/constants";
import type { FileWithPreview } from "@/hooks/use-file-upload";
import { formatDateLocale } from "@/lib/date-utils";
import { stripHtml } from "@/lib/excel-export";
import type { ProjectWithSupervisor } from "@/lib/pocketbase";
import { formatUserName } from "@/lib/utils";

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
    <div className="space-y-6 lg:col-span-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {projects.details.information}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3" data-animate-stagger>
            <User className="text-muted-foreground h-5 w-5" />
            <div className="flex-1">
              <p className="text-sm font-medium">
                {projects.details.supervisor}
              </p>
              {supervisor ? (
                <span className="text-muted-foreground text-sm">
                  {formatUserName(
                    supervisor.first_name,
                    supervisor.last_name,
                    supervisor.username,
                  )}
                </span>
              ) : (
                <span className="text-muted-foreground text-sm">-</span>
              )}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4" data-animate-stagger>
            <div className="flex items-start gap-3">
              <Calendar className="text-muted-foreground mt-0.5 h-5 w-5" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {projects.details.createdAt}
                </p>
                <p className="text-muted-foreground text-sm">
                  {formatDateLocale(project.created)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="text-muted-foreground mt-0.5 h-5 w-5" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {projects.details.updatedAt}
                </p>
                <p className="text-muted-foreground text-sm">
                  {formatDateLocale(project.updated)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{projects.details.description}</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Textarea
              value={editedDescription.replace(/<br>/g, "\n")}
              onChange={(event) => onDescriptionChange(event.target.value)}
              placeholder={projects.create.form.descriptionPlaceholder}
              className="min-h-32"
            />
          ) : project.description ? (
            <p className="max-w-none whitespace-pre-wrap">
              {stripHtml(project.description)}
            </p>
          ) : (
            <p className="text-muted-foreground py-6 text-center">
              {projects.details.noDescription}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{projects.details.files}</span>
            {!isEditing && project.assets && project.assets.length > 0 && (
              <span className="text-muted-foreground text-sm font-normal">
                {projects.details.filesCount.replace(
                  "{count}",
                  String(project.assets.length),
                )}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              {project.assets && project.assets.length > 0 && (
                <div className="space-y-2" data-animate-stagger>
                  <h4 className="text-sm font-medium">
                    {projects.files.existingFiles}
                  </h4>
                  <div className="grid grid-cols-1 gap-2" data-animate-stagger>
                    {project.assets
                      .filter((filename) => !filesToDelete.includes(filename))
                      .map((filename) => (
                        <div
                          key={filename}
                          className="bg-muted/50 flex items-center justify-between rounded-lg p-3"
                          data-interactive-item
                        >
                          <span className="flex-1 truncate text-sm">
                            {filename}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onDeleteFile(filename)}
                            className="text-destructive h-8 w-8 shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="space-y-2" data-animate-stagger>
                <h4 className="flex items-center gap-2 text-sm font-medium">
                  <Upload className="h-4 w-4" />
                  {projects.files.addNewFiles}
                </h4>
                <FileUpload
                  value={newFiles}
                  onChange={onNewFilesChange}
                  maxSize={52428800}
                />
              </div>
            </>
          ) : (
            <ProjectAssets project={project} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            {auditLogs.activityStream.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityStream resource="projects" resourceId={project.id} />
        </CardContent>
      </Card>
    </div>
  );
}
