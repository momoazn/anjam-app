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
import { useCurrentOrgRole } from "@/store/app-context-store";

export default function TagsManagement() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { data: tags, isLoading } = useTags();
  type Tag = NonNullable<typeof tags>[number];
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

  const { toast } = useToast();
  const userRole = useCurrentOrgRole();
  const canDeleteTag = userRole === "owner";

  const deleteTag = useDeleteTag();

  const handleEdit = (tag: Tag) => {
    setSelectedTag(tag);
    setEditDialogOpen(true);
  };

  const handleDelete = (tag: Tag) => {
    setSelectedTag(tag);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedTag) {
      try {
        await deleteTag.mutate(selectedTag._id);
        toast({ title: tagsManagement.toast.deleted });
        setDeleteDialogOpen(false);
        setSelectedTag(null);
      } catch {
        toast({
          title: tagsManagement.toast.deleteError,
          variant: "destructive",
        });
      }
    }
  };

  const headerActions = (
    <Button
      className="h-8 gap-2 rounded-lg px-3 text-xs font-semibold shadow-sm transition-all"
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

      <div className="space-y-4">
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
