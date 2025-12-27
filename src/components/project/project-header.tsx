import {
  IconPencil,
  IconChevronRight,
  IconDeviceFloppy,
  IconX,
  IconStack2,
  IconHash,
} from "@tabler/icons-react";
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
    <div className="bg-card border-border/40 relative mb-8 overflow-hidden rounded-[var(--ds-radius-card)] border shadow-sm">
      <div className="relative z-10 p-[var(--ds-spacing-cardPadding)] md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="bg-muted/30 hover:bg-primary hover:text-primary-foreground h-8 gap-2 rounded-lg px-4 text-[10px] font-bold tracking-tight transition-all"
          >
            <IconChevronRight className="size-3" />
            {projects.details.backToProjects || "Back to Projects"}
          </Button>

          {canEdit && !isEditing && (
            <Button
              variant="outline"
              onClick={onStartEdit}
              className="h-9 rounded-xl px-4 text-[10px] font-bold tracking-tight shadow-sm transition-all active:scale-95"
            >
              <IconPencil className="ms-1.5 size-3.5" />
              {common.edit}
            </Button>
          )}
        </div>

        {isEditing ? (
          <div className="animate-in fade-in slide-in-from-top-4 space-y-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end">
              <div className="flex-1 space-y-2">
                <span className="text-primary text-[10px] font-bold tracking-tight">
                  Project Name
                </span>
                <Input
                  value={editedName}
                  onChange={(event) => onNameChange(event.target.value)}
                  placeholder={projects.create.form.name}
                  className="bg-muted/30 h-14 rounded-xl border-none px-4 text-right text-2xl font-bold tracking-tight focus:ring-0"
                />
              </div>
              <div className="w-full space-y-2 lg:w-40">
                <span className="text-muted-foreground/40 text-[10px] font-bold tracking-tight">
                  Project Code
                </span>
                <Input
                  value={editedCode}
                  onChange={(event) =>
                    onCodeChange(event.target.value.slice(0, 3))
                  }
                  placeholder={projects.create.form.code}
                  maxLength={3}
                  className="bg-muted/30 focus:bg-muted/50 h-14 rounded-xl border-none text-center font-mono text-xl font-bold tracking-widest focus:ring-0"
                />
              </div>
            </div>

            <div className="border-border/10 flex items-center justify-end gap-3 border-t pt-6">
              <Button
                variant="ghost"
                onClick={onCancelEdit}
                disabled={isUpdating}
                className="h-10 rounded-xl px-6 text-[11px] font-bold tracking-tight"
              >
                <IconX className="ms-1.5 size-3.5" />
                {common.cancel}
              </Button>
              <Button
                onClick={onSaveEdit}
                disabled={isUpdating}
                className="bg-primary text-primary-foreground h-10 rounded-xl px-10 text-[11px] font-bold tracking-tight shadow-sm transition-all active:scale-95"
              >
                <IconDeviceFloppy className="ms-1.5 size-3.5" />
                {common.save}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <div className="text-primary/40 flex items-center gap-2">
                <IconHash className="size-4" />
                <span className="text-[10px] font-bold tracking-wider">
                  {project.code || "PRJ"}
                </span>
              </div>

              <h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
                {project.name}
              </h1>

              <div className="flex items-center gap-2">
                <div className="bg-primary/10 text-primary flex size-6 items-center justify-center rounded-lg">
                  <IconStack2 className="size-4" />
                </div>
                <span className="text-muted-foreground/60 text-[10px] font-bold tracking-tight">
                  Active Project Module
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
