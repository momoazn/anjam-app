import { useState } from "react";
import { IconTag, IconPlus } from "@tabler/icons-react";

import { PageTransition } from "@/components/page-transition";
import { PageHeader } from "@/components/page-header";
import { TagFormDialog } from "@/components/tags/tag-form-dialog";
import { TagsDeleteDialog } from "@/components/tags/tags-delete-dialog";
import { TagsList } from "@/components/tags/tags-list";
import { Button } from "@/components/ui/button";
import { tagsManagement } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import { useTags, useDeleteTag } from "@/hooks/tags";
import { handlePocketBaseError } from "@/lib/error-handler";
import type { TagsResponse } from "@/lib/pocketbase-types";
import { UsersRoleOptions } from "@/lib/pocketbase-types";
import { useAuthRole } from "@/store/auth-store";
import { digitsEnToFa } from "@persian-tools/persian-tools";

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

  const headerActions = (
    <Button
      className="h-14 gap-3 rounded-none px-8 font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:scale-95 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]"
      size="lg"
      onClick={() => setCreateDialogOpen(true)}
    >
      <IconPlus className="size-5" />
      <span className="tracking-widest uppercase">{tagsManagement.addTag}</span>
    </Button>
  );

  return (
    <PageTransition className="container mx-auto p-4 md:p-6">
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
        nodeId="Tag_Index"
        actions={headerActions}
      />

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
