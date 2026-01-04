import { digitsEnToFa } from "@persian-tools/persian-tools";
import { IconPlus, IconTag } from "@tabler/icons-react";
import { useState } from "react";

import { PageHeader } from "@/components/page-header";
import { PageTransition } from "@/components/page-transition";
import { TagFormDialog } from "@/components/tags/tag-form-dialog";
import { TagsDeleteDialog } from "@/components/tags/tags-delete-dialog";
import { TagsList } from "@/components/tags/tags-list";
import { Button } from "@/components/ui/button";
import { tagsManagement } from "@/constants";
import { useDeleteTag, useTags } from "@/hooks/tags";
import { useToast } from "@/hooks/use-toast";
import { handlePocketBaseError } from "@/lib/error-handler";
import type { TagsResponse } from "@/lib/pocketbase-types";
import { UsersRoleOptions } from "@/lib/pocketbase-types";
import { cn } from "@/lib/utils";
import { useAuthRole, useCurrentOrgMode } from "@/store/auth-store";

export default function TagsManagement() {
  const mode = useCurrentOrgMode();
  const isProductMode = mode === "product";
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<TagsResponse | null>(null);

  const { data: tags, isLoading } = useTags();
  const { toast } = useToast();
  const userRole = useAuthRole();
  const canDeleteTag = userRole !== UsersRoleOptions.employee;

  const deleteTag = useDeleteTag({
    onSuccess: () => {
      toast({ title: tagsManagement.toast.deleted });
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

  const headerActions = (
    <Button
      className={cn(
        "gap-2 rounded-xl shadow-sm transition-all",
        isProductMode
          ? "h-8 rounded-lg px-3 text-xs font-semibold"
          : "h-10 px-5 text-sm font-bold hover:scale-[1.02]",
      )}
      onClick={() => setCreateDialogOpen(true)}
    >
      <IconPlus className="size-4.5" />
      <span>{tagsManagement.addTag}</span>
    </Button>
  );

  return (
    <PageTransition className="container mx-auto max-w-7xl p-4 md:p-6">
      <PageHeader
        title={tagsManagement.title}
        description={
          tags && tags.length > 0
            ? tagsManagement.tagsCount.replace(
                "{count}",
                digitsEnToFa(tags.length).toString(),
              )
            : tagsManagement.description
        }
        icon={IconTag}
        actions={headerActions}
      />

      <div className={cn("space-y-6", isProductMode && "space-y-4")}>
        <TagsList
          tags={tags}
          isLoading={isLoading}
          canDeleteTag={canDeleteTag}
          onCreateClick={() => setCreateDialogOpen(true)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <TagFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        mode="create"
      />

      {selectedTag && (
        <TagFormDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          tag={selectedTag}
          mode="edit"
        />
      )}

      <TagsDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        isDeleting={deleteTag.isPending}
      />
    </PageTransition>
  );
}
