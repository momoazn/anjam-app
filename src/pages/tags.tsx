import { useState } from "react";
import { Plus, Tag, Pencil, Trash2 } from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { text } from "@/constants/text";
import {
  useTags,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
} from "@/hooks/tags";
import type { TagsResponse } from "@/lib/pocketbase-types";
import { useToast } from "@/hooks/use-toast";
import { handlePocketBaseError } from "@/lib/error-handler";

// Predefined color palette for tags
const TAG_COLORS = [
  { value: "#9CA3AF", label: text.tagsManagement.colors.gray },
  { value: "#EF4444", label: text.tagsManagement.colors.red },
  { value: "#F97316", label: text.tagsManagement.colors.orange },
  { value: "#F59E0B", label: text.tagsManagement.colors.yellow },
  { value: "#10B981", label: text.tagsManagement.colors.green },
  { value: "#3B82F6", label: text.tagsManagement.colors.blue },
  { value: "#8B5CF6", label: text.tagsManagement.colors.purple },
  { value: "#EC4899", label: text.tagsManagement.colors.pink },
];

// Loading skeleton component
const TagsListSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <Card key={i}>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Empty state component
const EmptyState = ({ onCreateClick }: { onCreateClick: () => void }) => (
  <Card className="border-dashed">
    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
      <div
        className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-full"
        data-interactive-pulse
      >
        <Tag className="text-primary h-6 w-6" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">
        {text.tagsManagement.noTags}
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        {text.tagsManagement.noTagsDescription}
      </p>
      <Button className="gap-2" onClick={onCreateClick}>
        <Plus className="h-4 w-4" />
        {text.tagsManagement.createFirstTag}
      </Button>
    </CardContent>
  </Card>
);

// Tag form dialog
interface TagFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag?: TagsResponse;
  mode: "create" | "edit";
}

function TagFormDialog({ open, onOpenChange, tag, mode }: TagFormDialogProps) {
  const [name, setName] = useState(tag?.name || "");
  const [color, setColor] = useState(tag?.color || TAG_COLORS[0].value);
  const { toast } = useToast();

  const createTag = useCreateTag({
    onSuccess: () => {
      toast({ title: text.tagsManagement.toast.created });
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      handlePocketBaseError(error);
    },
  });

  const updateTag = useUpdateTag({
    onSuccess: () => {
      toast({ title: text.tagsManagement.toast.updated });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: text.tagsManagement.validation.nameRequired,
        variant: "destructive",
      });
      return;
    }

    if (mode === "create") {
      createTag.mutate({ name: name.trim(), color });
    } else if (tag) {
      updateTag.mutate({ id: tag.id, data: { name: name.trim(), color } });
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  // Update form when tag changes
  if (tag && mode === "edit" && name !== tag.name) {
    setName(tag.name || "");
    setColor(tag.color || TAG_COLORS[0].value);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {mode === "create"
                ? text.tagsManagement.createTag
                : text.tagsManagement.editTag}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? text.tagsManagement.description
                : text.tagsManagement.editTag}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tag-name">{text.tagsManagement.nameLabel}</Label>
              <Input
                id="tag-name"
                placeholder={text.tagsManagement.namePlaceholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>{text.tagsManagement.colorLabel}</Label>
              <div className="grid grid-cols-4 gap-2">
                {TAG_COLORS.map((tagColor) => (
                  <button
                    key={tagColor.value}
                    type="button"
                    className={`flex h-12 items-center justify-center rounded-md border-2 transition-all ${
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
              <Label>{text.common.preview}</Label>
              <div className="flex items-center gap-2">
                <Badge
                  style={{
                    backgroundColor: color,
                    color: "#FFFFFF",
                    border: "none",
                  }}
                >
                  {name || text.tagsManagement.tagName}
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
              {text.tagsManagement.cancelButton}
            </Button>
            <Button
              type="submit"
              disabled={createTag.isPending || updateTag.isPending}
            >
              {mode === "create"
                ? text.tagsManagement.createButton
                : text.tagsManagement.saveButton}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function TagsManagement() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<TagsResponse | null>(null);

  const { data: tags, isLoading } = useTags();
  const { toast } = useToast();

  const deleteTag = useDeleteTag({
    onSuccess: () => {
      toast({ title: text.tagsManagement.toast.deleted });
      setDeleteDialogOpen(false);
      setSelectedTag(null);
    },
    onError: (error) => {
      handlePocketBaseError(error);
    },
  });

  const handleEdit = (tag: TagsResponse) => {
    setSelectedTag(tag);
    setEditDialogOpen(true);
  };

  const handleDelete = (tag: TagsResponse) => {
    setSelectedTag(tag);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedTag) {
      deleteTag.mutate(selectedTag.id);
    }
  };

  return (
    <PageTransition className="container mx-auto p-4 md:p-6">
      {/* Header Section */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
            <Tag className="h-5 w-5 md:h-6 md:w-6" />
            {text.tagsManagement.title}
          </h1>
          <p className="text-muted-foreground mt-2">
            {tags && tags.length > 0
              ? text.tagsManagement.tagsCount.replace(
                  "{count}",
                  tags.length.toString(),
                )
              : text.tagsManagement.description}
          </p>
        </div>
        <Button
          className="gap-2"
          size="lg"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          {text.tagsManagement.addTag}
        </Button>
      </div>

      {/* Tags List */}
      <div className="space-y-6">
        {isLoading ? (
          <TagsListSkeleton />
        ) : !tags || tags.length === 0 ? (
          <EmptyState onCreateClick={() => setCreateDialogOpen(true)} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tags.map((tag) => (
              <Card key={tag.id} className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded"
                      style={{ backgroundColor: tag.color }}
                    />
                    <div>
                      <p className="font-medium">{tag.name}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(tag)}
                      title={text.tagsManagement.editButton}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(tag)}
                      title={text.tagsManagement.deleteButton}
                    >
                      <Trash2 className="text-destructive h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <TagFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        mode="create"
      />

      {/* Edit Dialog */}
      {selectedTag && (
        <TagFormDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          tag={selectedTag}
          mode="edit"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {text.tagsManagement.deleteConfirm.title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {text.tagsManagement.deleteConfirm.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {text.tagsManagement.deleteConfirm.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteTag.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {text.tagsManagement.deleteConfirm.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageTransition>
  );
}
