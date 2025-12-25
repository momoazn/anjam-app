import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { common, tagsManagement } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import { useCreateTag, useUpdateTag } from "@/hooks/tags";
import { handlePocketBaseError } from "@/lib/error-handler";
import type { TagsResponse } from "@/lib/pocketbase-types";

const TAG_COLORS = [
  { value: "#9CA3AF", label: tagsManagement.colors.gray },
  { value: "#EF4444", label: tagsManagement.colors.red },
  { value: "#F97316", label: tagsManagement.colors.orange },
  { value: "#F59E0B", label: tagsManagement.colors.yellow },
  { value: "#10B981", label: tagsManagement.colors.green },
  { value: "#3B82F6", label: tagsManagement.colors.blue },
  { value: "#8B5CF6", label: tagsManagement.colors.purple },
  { value: "#EC4899", label: tagsManagement.colors.pink },
];

export type TagFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag?: TagsResponse;
  mode: "create" | "edit";
};

export function TagFormDialog({
  open,
  onOpenChange,
  tag,
  mode,
}: TagFormDialogProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(TAG_COLORS[0].value);
  const { toast } = useToast();

  const createTag = useCreateTag({
    onSuccess: () => {
      toast({ title: tagsManagement.toast.created });
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      handlePocketBaseError(error);
    },
  });

  const updateTag = useUpdateTag({
    onSuccess: () => {
      toast({ title: tagsManagement.toast.updated });
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      handlePocketBaseError(error);
    },
  });

  const resetForm = () => {
    setName("");
    setColor(TAG_COLORS[0].value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!name.trim()) {
      toast({
        title: tagsManagement.validation.nameRequired,
        variant: "destructive",
      });
      return;
    }

    if (mode === "create") {
      createTag.mutate({ name: name.trim(), color });
    } else if (tag) {
      updateTag.mutate({ id: tag.id, updates: { name: name.trim(), color } });
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  useEffect(() => {
    if (open) {
      if (tag && mode === "edit") {
        setName(tag.name || "");
        setColor(tag.color || TAG_COLORS[0].value);
      } else {
        setName("");
        setColor(TAG_COLORS[0].value);
      }
    }
  }, [open, tag, mode]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {mode === "create"
                ? tagsManagement.createTag
                : tagsManagement.editTag}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? tagsManagement.description
                : tagsManagement.editTag}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tag-name">{tagsManagement.nameLabel}</Label>
              <Input
                id="tag-name"
                placeholder={tagsManagement.namePlaceholder}
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>{tagsManagement.colorLabel}</Label>
              <div className="grid grid-cols-4 gap-2">
                {TAG_COLORS.map((tagColor) => (
                  <button
                    key={tagColor.value}
                    type="button"
                    className={`flex h-12 items-center justify-center rounded-none border transition-all ${
                      color === tagColor.value
                        ? "border-primary ring-primary ring-2 ring-offset-2"
                        : "hover:border-muted-foreground/20 border-transparent"
                    }`}
                    style={{ backgroundColor: tagColor.value }}
                    onClick={() => setColor(tagColor.value)}
                    title={tagColor.label}
                  >
                    {color === tagColor.value && (
                      <span className="text-white">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{common.preview}</Label>
              <div className="flex items-center gap-2">
                <Badge
                  style={{
                    backgroundColor: color,
                    color: "#FFFFFF",
                    border: "none",
                  }}
                >
                  {name || tagsManagement.tagName}
                </Badge>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              {tagsManagement.cancelButton}
            </Button>
            <Button
              type="submit"
              disabled={createTag.isPending || updateTag.isPending}
            >
              {mode === "create"
                ? tagsManagement.createButton
                : tagsManagement.saveButton}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
