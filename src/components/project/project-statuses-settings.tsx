import { useEffect, useMemo, useState } from "react";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconGripVertical,
  IconPlus,
  IconTrash,
  IconCheck,
} from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjectStatuses } from "@/hooks/project-statuses";
import { usePermissions } from "@/hooks/usePermissions";
import { pb } from "@/lib/pocketbase";
import type { ProjectStatusesResponse } from "@/lib/pocketbase-types";
import { queryKeys } from "@/hooks/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import { projectStatuses } from "@/constants/misc";

const colorOptions = [
  { value: "slate", label: "Slate" },
  { value: "blue", label: "Blue" },
  { value: "purple", label: "Purple" },
  { value: "amber", label: "Amber" },
  { value: "cyan", label: "Cyan" },
  { value: "orange", label: "Orange" },
  { value: "gray", label: "Gray" },
  { value: "green", label: "Green" },
];

function slugifyKey(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_");
}

type ProjectStatusesSettingsProps = {
  projectId: string;
};

type StatusDraft = {
  name: string;
  color: string;
};

type SortableStatusRowProps = {
  status: ProjectStatusesResponse;
  draft: StatusDraft;
  onDraftChange: (updates: Partial<StatusDraft>) => void;
  onSave: () => void;
  onToggleDefault: () => void;
  onToggleDone: () => void;
  onDelete: () => void;
  disabled?: boolean;
};

function SortableStatusRow({
  status,
  draft,
  onDraftChange,
  onSave,
  onToggleDefault,
  onToggleDone,
  onDelete,
  disabled,
}: SortableStatusRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: status.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const hasChanges = draft.name !== status.name || draft.color !== status.color;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border-border/20 grid grid-cols-12 items-center gap-3 border-b px-4 py-3 text-right ${
        isDragging ? "bg-muted/30" : "bg-card"
      }`}
    >
      <div
        className="text-muted-foreground/50 col-span-1 flex items-center justify-center"
        {...attributes}
        {...listeners}
      >
        <IconGripVertical className="size-4" />
      </div>
      <div className="col-span-3">
        <Input
          value={draft.name}
          onChange={(event) => onDraftChange({ name: event.target.value })}
          className="border-border/40 bg-muted/5 h-10 rounded-lg text-right text-xs font-bold tracking-tight"
          disabled={disabled}
        />
      </div>
      <div className="col-span-2">
        <Select
          value={draft.color}
          onValueChange={(value) => onDraftChange({ color: value })}
          disabled={disabled}
        >
          <SelectTrigger className="border-border/40 bg-muted/5 h-10 rounded-lg border text-right text-[10px] font-bold tracking-tight focus:ring-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-border bg-card rounded-xl border">
            {colorOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="text-right text-[10px] font-bold"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-2 flex items-center justify-center">
        <Switch
          checked={Boolean(status.is_default)}
          onCheckedChange={onToggleDefault}
          disabled={disabled}
        />
      </div>
      <div className="col-span-2 flex items-center justify-center">
        <Switch
          checked={Boolean(status.is_done)}
          onCheckedChange={onToggleDone}
          disabled={disabled}
        />
      </div>
      <div className="col-span-2 flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 rounded-lg"
          onClick={onSave}
          disabled={disabled || !hasChanges}
        >
          <IconCheck className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 rounded-lg text-rose-500 hover:bg-rose-500/10"
          onClick={onDelete}
          disabled={disabled}
        >
          <IconTrash className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function ProjectStatusesSettings({
  projectId,
}: ProjectStatusesSettingsProps) {
  const queryClient = useQueryClient();
  const { can } = usePermissions(projectId);
  const canManageStatuses = can("project.update");
  const { data: statuses } = useProjectStatuses({ projectId });

  const [order, setOrder] = useState<ProjectStatusesResponse[]>([]);
  const [drafts, setDrafts] = useState<Record<string, StatusDraft>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("slate");
  const [newIsDefault, setNewIsDefault] = useState(false);
  const [newIsDone, setNewIsDone] = useState(false);

  useEffect(() => {
    if (!statuses) return;
    setOrder(statuses);
    setDrafts((prev) => {
      const next: Record<string, StatusDraft> = { ...prev };
      statuses.forEach((status) => {
        next[status.id] = {
          name: status.name,
          color: status.color || "slate",
        };
      });
      return next;
    });
  }, [statuses]);

  const orderedIds = useMemo(() => order.map((status) => status.id), [order]);

  const persistOrder = async (nextOrder: ProjectStatusesResponse[]) => {
    if (!nextOrder.length) return;
    setIsSaving(true);
    try {
      await Promise.all(
        nextOrder.map((status, index) =>
          pb.collection("project_statuses").update(status.id, {
            order: index + 1,
          }),
        ),
      );
      toast.success(projectStatuses.toasts.orderSaved);
      queryClient.invalidateQueries({
        queryKey: queryKeys.projectStatuses.byProject(projectId),
      });
    } catch (error) {
      toast.error(projectStatuses.toasts.orderSaveFailed);
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setOrder((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const nextOrder = arrayMove(items, oldIndex, newIndex);
      persistOrder(nextOrder);
      return nextOrder;
    });
  };

  const handleSave = async (status: ProjectStatusesResponse) => {
    const draft = drafts[status.id];
    if (!draft) return;
    setIsSaving(true);
    try {
      await pb.collection("project_statuses").update(status.id, {
        name: draft.name,
        color: draft.color,
      });
      toast.success(projectStatuses.toasts.updated);
      queryClient.invalidateQueries({
        queryKey: queryKeys.projectStatuses.byProject(projectId),
      });
    } catch (error) {
      toast.error(projectStatuses.toasts.updateFailed);
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleDefault = async (status: ProjectStatusesResponse) => {
    if (!statuses) return;
    setIsSaving(true);
    try {
      await Promise.all(
        statuses.map((item) =>
          pb.collection("project_statuses").update(item.id, {
            is_default: item.id === status.id,
          }),
        ),
      );
      toast.success(projectStatuses.toasts.defaultUpdated);
      queryClient.invalidateQueries({
        queryKey: queryKeys.projectStatuses.byProject(projectId),
      });
    } catch (error) {
      toast.error(projectStatuses.toasts.defaultUpdateFailed);
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleDone = async (status: ProjectStatusesResponse) => {
    setIsSaving(true);
    try {
      await pb.collection("project_statuses").update(status.id, {
        is_done: !status.is_done,
      });
      toast.success(projectStatuses.toasts.doneUpdated);
      queryClient.invalidateQueries({
        queryKey: queryKeys.projectStatuses.byProject(projectId),
      });
    } catch (error) {
      toast.error(projectStatuses.toasts.doneUpdateFailed);
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (status: ProjectStatusesResponse) => {
    setIsSaving(true);
    try {
      try {
        await pb
          .collection("tasks")
          .getFirstListItem(
            `project = "${projectId}" && status = "${status.key}"`,
          );
        toast.error(projectStatuses.toasts.inUse);
        return;
      } catch (error: unknown) {
        const isNotFound =
          typeof error === "object" &&
          error !== null &&
          "status" in error &&
          (error as { status?: number }).status === 404;
        if (!isNotFound) {
          throw error;
        }
      }

      await pb.collection("project_statuses").delete(status.id);
      toast.success(projectStatuses.toasts.deleted);
      queryClient.invalidateQueries({
        queryKey: queryKeys.projectStatuses.byProject(projectId),
      });
    } catch (error) {
      toast.error(projectStatuses.toasts.deleteFailed);
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdd = async () => {
    if (!newName.trim()) {
      toast.error(projectStatuses.toasts.nameRequired);
      return;
    }
    const key = slugifyKey(newName);
    const nextOrder = (order?.length ?? 0) + 1;
    setIsSaving(true);
    try {
      const newStatus = await pb.collection("project_statuses").create({
        project: projectId,
        key,
        name: newName.trim(),
        color: newColor,
        order: nextOrder,
        is_default: newIsDefault,
        is_done: newIsDone,
      });

      if (newIsDefault && statuses) {
        await Promise.all(
          statuses
            .filter((status) => status.id !== newStatus.id)
            .map((status) =>
              pb.collection("project_statuses").update(status.id, {
                is_default: false,
              }),
            ),
        );
      }

      toast.success(projectStatuses.toasts.created);
      setNewName("");
      setNewColor("slate");
      setNewIsDefault(false);
      setNewIsDone(false);
      queryClient.invalidateQueries({
        queryKey: queryKeys.projectStatuses.byProject(projectId),
      });
    } catch (error) {
      toast.error(projectStatuses.toasts.createFailed);
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!projectId) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="text-muted-foreground text-[10px] font-bold tracking-tight">
          {projectStatuses.settings.title}
        </div>
      </div>

      <div className="bg-muted/5 border-border/40 rounded-2xl border p-4">
        <div className="border-border/20 grid grid-cols-12 items-center gap-3 border-b pb-3 text-right text-[9px] font-bold tracking-tight opacity-60">
          <div className="col-span-1" />
          <div className="col-span-3">{projectStatuses.headers.name}</div>
          <div className="col-span-2">{projectStatuses.headers.color}</div>
          <div className="col-span-2 text-center">
            {projectStatuses.headers.default}
          </div>
          <div className="col-span-2 text-center">
            {projectStatuses.headers.done}
          </div>
          <div className="col-span-2 text-center">
            {projectStatuses.headers.actions}
          </div>
        </div>

        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={orderedIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="divide-border/20 divide-y">
              {order.map((status) => (
                <SortableStatusRow
                  key={status.id}
                  status={status}
                  draft={
                    drafts[status.id] ?? {
                      name: status.name,
                      color: status.color || "slate",
                    }
                  }
                  onDraftChange={(updates) =>
                    setDrafts((prev) => ({
                      ...prev,
                      [status.id]: {
                        ...prev[status.id],
                        ...updates,
                      },
                    }))
                  }
                  onSave={() => handleSave(status)}
                  onToggleDefault={() => handleToggleDefault(status)}
                  onToggleDone={() => handleToggleDone(status)}
                  onDelete={() => handleDelete(status)}
                  disabled={!canManageStatuses || isSaving}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {canManageStatuses && (
        <div className="border-border/40 bg-muted/5 rounded-2xl border p-4">
          <div className="mb-3 text-[10px] font-bold tracking-tight opacity-60">
            {projectStatuses.settings.addStatus}
          </div>
          <div className="grid grid-cols-12 items-center gap-3">
            <div className="col-span-5">
              <Input
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                placeholder={projectStatuses.settings.placeholder}
                className="border-border/40 bg-muted/5 h-10 rounded-lg text-right text-xs font-bold tracking-tight"
                disabled={isSaving}
              />
            </div>
            <div className="col-span-3">
              <Select
                value={newColor}
                onValueChange={setNewColor}
                disabled={isSaving}
              >
                <SelectTrigger className="border-border/40 bg-muted/5 h-10 rounded-lg border text-right text-[10px] font-bold tracking-tight focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-card rounded-xl border">
                  {colorOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-right text-[10px] font-bold"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 flex items-center justify-center gap-2 text-[9px] font-bold tracking-tight">
              <Switch
                checked={newIsDefault}
                onCheckedChange={(value) => setNewIsDefault(Boolean(value))}
                disabled={isSaving}
              />
              {projectStatuses.headers.default}
            </div>
            <div className="col-span-2 flex items-center justify-center gap-2 text-[9px] font-bold tracking-tight">
              <Switch
                checked={newIsDone}
                onCheckedChange={(value) => setNewIsDone(Boolean(value))}
                disabled={isSaving}
              />
              {projectStatuses.headers.done}
            </div>
            <div className="col-span-12 flex justify-end">
              <Button
                type="button"
                className="rounded-xl"
                onClick={handleAdd}
                disabled={isSaving}
              >
                <IconPlus className="ms-2 size-4" />
                {projectStatuses.settings.addStatus}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
