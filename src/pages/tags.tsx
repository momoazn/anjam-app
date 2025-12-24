import { useState } from "react";

import { PageTransition } from "@/components/page-transition";
import { TagFormDialog } from "@/components/tags/tag-form-dialog";
import { TagsDeleteDialog } from "@/components/tags/tags-delete-dialog";
import { TagsHeader } from "@/components/tags/tags-header";
import { TagsList } from "@/components/tags/tags-list";
import { tagsManagement } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import { useTags, useDeleteTag } from "@/hooks/tags";
import { handlePocketBaseError } from "@/lib/error-handler";
import type { TagsResponse } from "@/lib/pocketbase-types";
import { UsersRoleOptions } from "@/lib/pocketbase-types";
import { useAuthRole } from "@/store/auth-store";

export default function TagsManagement() {
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

  return (
    <PageTransition className="container mx-auto p-4 md:p-6">
      <TagsHeader tags={tags} onCreateClick={() => setCreateDialogOpen(true)} />

      <div className="space-y-6">
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
