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

import { Card, CardContent } from "@/components/ui/card";

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
                className="text-muted-foreground/60 h-12 rounded-none px-6 text-[10px] font-black tracking-tight uppercase"
              >
                <IconX className="ms-2 size-4" />
                {common.cancel}
              </Button>
              <Button
                onClick={onSaveEdit}
                disabled={isUpdating}
                className="h-12 rounded-none px-8 font-black shadow-md transition-all hover:shadow-lg active:scale-95"
              >
                <IconDeviceFloppy className="ms-2 size-4" />
                {common.save}
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={onStartEdit}
              className="border-border bg-card h-12 rounded-none border px-8 text-[10px] font-black tracking-tight uppercase shadow-md transition-all active:shadow-none dark:shadow-[-4px_4px_0px_0px_rgba(255,255,255,0.05)]"
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
    <div className="space-y-6 text-right">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="group text-muted-foreground/40 hover:text-primary gap-2 p-0 text-[10px] font-black tracking-tight uppercase transition-all"
      >
        <IconChevronRight className="size-3" />
        Back to Projects
      </Button>

      {isEditing ? (
        <Card className="border-border/40 overflow-hidden rounded-none shadow-md">
          <CardContent className="p-8">
            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex-1 space-y-6">
                <div className="space-y-1.5 text-right">
                  <span className="text-primary/60 text-[10px] font-black tracking-tight uppercase">
                    Edit Project Name
                  </span>
                  <Input
                    value={editedName}
                    onChange={(event) => onNameChange(event.target.value)}
                    placeholder={projects.create.form.name}
                    className="border-border/40 bg-muted/5 focus:border-primary/40 h-14 rounded-none text-right text-2xl font-black tracking-tight uppercase focus:ring-0"
                  />
                </div>
                <div className="ms-auto w-40 space-y-1.5 text-right">
                  <span className="text-muted-foreground/40 text-[10px] font-black tracking-tight uppercase">
                    Project Code
                  </span>
                  <Input
                    value={editedCode}
                    onChange={(event) =>
                      onCodeChange(event.target.value.slice(0, 3))
                    }
                    placeholder={projects.create.form.code}
                    maxLength={3}
                    className="border-border/40 bg-muted/5 focus:border-primary/40 h-10 rounded-none text-center font-mono text-xs font-black tracking-tight uppercase focus:ring-0"
                  />
                </div>
              </div>
              {headerActions}
            </div>
          </CardContent>
        </Card>
      ) : (
        <PageHeader
          title={project.name}
          description={`Project details and management for team members and stakeholders.`}
          icon={IconStack2}
          actions={headerActions}
        />
      )}
    </div>
  );
}
