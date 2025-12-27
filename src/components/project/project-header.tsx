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
import { BlueprintPattern } from "@/components/design-system/blueprint-pattern";

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
    <div className="border-primary bg-card relative mb-8 overflow-hidden border-b-2">
      <BlueprintPattern variant="technical" className="opacity-[0.03]" />

      <div className="relative z-10 p-6 md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="group border-border/40 bg-background/50 hover:bg-primary hover:text-primary-foreground h-8 gap-2 rounded-none border px-4 text-[10px] font-black tracking-tight uppercase backdrop-blur-sm transition-all"
          >
            <IconChevronRight className="size-3" />
            {projects.details.backToProjects || "Back to Projects"}
          </Button>

          {canEdit && !isEditing && (
            <Button
              variant="outline"
              onClick={onStartEdit}
              className="border-primary bg-background h-9 rounded-none border-2 px-4 text-[10px] font-black tracking-widest uppercase shadow-[2px_2px_0px_0px_var(--primary)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
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
                <span className="text-primary text-[9px] font-black tracking-[0.2em] uppercase">
                  Project_Nomenclature
                </span>
                <Input
                  value={editedName}
                  onChange={(event) => onNameChange(event.target.value)}
                  placeholder={projects.create.form.name}
                  className="border-primary bg-background h-14 rounded-none border-2 px-4 text-right text-2xl font-black tracking-tighter uppercase focus:ring-0"
                />
              </div>
              <div className="w-full space-y-2 lg:w-40">
                <span className="text-muted-foreground/40 text-[9px] font-black tracking-[0.2em] uppercase">
                  System_Code
                </span>
                <Input
                  value={editedCode}
                  onChange={(event) =>
                    onCodeChange(event.target.value.slice(0, 3))
                  }
                  placeholder={projects.create.form.code}
                  maxLength={3}
                  className="border-border/40 bg-background focus:border-primary h-14 rounded-none border-2 text-center font-mono text-xl font-black tracking-widest uppercase focus:ring-0"
                />
              </div>
            </div>

            <div className="border-border/10 flex items-center justify-end gap-3 border-t-2 pt-6">
              <Button
                variant="ghost"
                onClick={onCancelEdit}
                disabled={isUpdating}
                className="h-10 rounded-none px-6 text-[9px] font-black tracking-widest uppercase"
              >
                <IconX className="ms-1.5 size-3.5" />
                {common.cancel}
              </Button>
              <Button
                onClick={onSaveEdit}
                disabled={isUpdating}
                className="bg-primary text-primary-foreground h-10 rounded-none px-10 text-[9px] font-black tracking-widest uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] transition-all active:translate-y-0.5 active:shadow-none"
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
                <span className="text-[10px] font-black tracking-[0.2em] uppercase">
                  {project.code || "PRJ"}
                </span>
              </div>

              <h1 className="max-w-4xl text-4xl font-black tracking-tighter uppercase md:text-6xl">
                {project.name}
              </h1>

              <div className="flex items-center gap-2">
                <div className="bg-primary/10 text-primary flex size-5 items-center justify-center">
                  <IconStack2 className="size-3.5" />
                </div>
                <span className="text-muted-foreground/60 text-[9px] font-black tracking-[0.2em] uppercase">
                  Project_Core_Module :: Active_Deployment
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Decorative technical elements */}
      <div className="border-primary/20 bg-background/50 absolute right-0 bottom-0 flex h-10 w-56 items-center justify-center border-s-2 border-t-2 px-4 backdrop-blur-sm">
        <div className="flex w-full items-center justify-between gap-2 opacity-20">
          <div className="bg-primary h-1 w-1" />
          <div className="bg-primary h-px flex-1" />
          <span className="text-[7px] font-black tracking-[0.4em] uppercase">
            System_Integrity_OK
          </span>
          <div className="bg-primary h-px flex-1" />
          <div className="bg-primary h-1 w-1" />
        </div>
      </div>
    </div>
  );
}
