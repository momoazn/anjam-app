import { ArrowLeft, Edit, Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { common, projects } from "@/constants";
import type { ProjectWithSupervisor } from "@/lib/pocketbase";

type ProjectHeaderProps = {
  project: ProjectWithSupervisor;
  canEdit: boolean;
  isEditing: boolean;
  editedName: string;
  editedCode: string;
  isUpdating: boolean;
  onNameChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onBack: () => void;
};

export function ProjectHeader({
  project,
  canEdit,
  isEditing,
  editedName,
  editedCode,
  isUpdating,
  onNameChange,
  onCodeChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onBack,
}: ProjectHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        {isEditing ? (
          <div className="flex-1 space-y-2">
            <Input
              value={editedName}
              onChange={(event) => onNameChange(event.target.value)}
              placeholder={projects.create.form.name}
              className="h-auto text-2xl font-bold"
            />
            <Input
              value={editedCode}
              onChange={(event) => onCodeChange(event.target.value.slice(0, 3))}
              placeholder={projects.create.form.code}
              maxLength={3}
              className="w-32"
            />
          </div>
        ) : (
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground">
              {common.buttons.view} {project.code}
            </p>
          </div>
        )}
      </div>
      {canEdit && (
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onCancelEdit}
                disabled={isUpdating}
              >
                <X className="mr-2 h-4 w-4" />
                {common.cancel}
              </Button>
              <Button size="sm" onClick={onSaveEdit} disabled={isUpdating}>
                <Save className="mr-2 h-4 w-4" />
                {common.save}
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={onStartEdit}>
              <Edit className="mr-2 h-4 w-4" />
              {common.edit}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
