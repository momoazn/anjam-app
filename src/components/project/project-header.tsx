import {
  IconPencil,
  IconChevronRight,
  IconDeviceFloppy,
  IconX,
  IconStack2,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
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
  const headerActions = (
    <div className="flex flex-wrap gap-2">
      {canEdit && (
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                onClick={onCancelEdit}
                disabled={isUpdating}
                className="text-muted-foreground/60 h-12 rounded-none px-6 text-[10px] font-black tracking-widest uppercase"
              >
                <IconX className="ms-2 size-4" />
                {common.cancel}
              </Button>
              <Button
                onClick={onSaveEdit}
                disabled={isUpdating}
                className="h-12 rounded-none px-8 font-black shadow-[-4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:scale-95 dark:shadow-[-4px_4px_0px_0px_rgba(255,255,255,0.1)]"
              >
                <IconDeviceFloppy className="ms-2 size-4" />
                {common.save}
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={onStartEdit}
              className="border-foreground bg-card h-12 rounded-none border-2 px-8 text-[10px] font-black tracking-widest uppercase shadow-[-4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-[-2px] active:translate-y-[2px] active:shadow-none dark:shadow-[-4px_4px_0px_0px_rgba(255,255,255,0.05)]"
            >
              <IconPencil className="ms-2 size-4" />
              {common.edit}
            </Button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="group text-muted-foreground/40 hover:text-primary gap-2 p-0 text-[10px] font-black tracking-[0.3em] uppercase transition-all"
      >
        <IconChevronRight className="size-3" />
        Back_To_Registry
      </Button>

      {isEditing ? (
        <div className="border-border/40 bg-card relative overflow-hidden rounded-none border p-8 shadow-xl">
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex-1 space-y-6">
              <div className="space-y-1.5 text-right">
                <span className="text-primary/60 text-[10px] font-black tracking-[0.2em] uppercase">
                  Project_Identity_Modification
                </span>
                <Input
                  value={editedName}
                  onChange={(event) => onNameChange(event.target.value)}
                  placeholder={projects.create.form.name}
                  className="border-border/40 bg-muted/5 focus:border-primary/40 h-14 rounded-none text-right text-2xl font-black tracking-tight uppercase focus:ring-0"
                />
              </div>
              <div className="ms-auto ms-0 w-40 space-y-1.5 text-right">
                <span className="text-muted-foreground/40 text-[10px] font-black tracking-[0.2em] uppercase">
                  Unique_Code
                </span>
                <Input
                  value={editedCode}
                  onChange={(event) =>
                    onCodeChange(event.target.value.slice(0, 3))
                  }
                  placeholder={projects.create.form.code}
                  maxLength={3}
                  className="border-border/40 bg-muted/5 focus:border-primary/40 h-10 rounded-none text-center font-mono text-xs font-black tracking-[0.3em] uppercase focus:ring-0"
                />
              </div>
            </div>
            {headerActions}
          </div>
        </div>
      ) : (
        <PageHeader
          title={project.name}
          description={`Centralized repository for project nodes :: Access authorized for supervisor level and above`}
          icon={IconStack2}
          nodeId={`Project_Registry :: ${project.code}`}
          actions={headerActions}
        />
      )}
    </div>
  );
}
