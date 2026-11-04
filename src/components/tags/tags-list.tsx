import { digitsEnToFa } from "@persian-tools/persian-tools";
import { IconPencil, IconPlus, IconTag, IconTrash } from "@tabler/icons-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { tagsManagement } from "@/constants";
import type { Tag } from "@/hooks/tags";
import { useAllTasks } from "@/hooks/tasks";

type TagsListProps = {
  tags: Tag[] | undefined;
  isLoading: boolean;
  canDeleteTag: boolean;
  onCreateClick: () => void;
  onEdit: (tag: Tag) => void;
  onDelete: (tag: Tag) => void;
};

const TagsListSkeleton = () => (
  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
      <div
        key={i}
        className="bg-card border-border/40 rounded-2xl border p-4 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20 rounded-lg" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
        <Skeleton className="mt-4 h-2 w-full rounded-full" />
      </div>
    ))}
  </div>
);

const EmptyState = ({ onCreateClick }: { onCreateClick: () => void }) => (
  <div className="border-border/40 flex flex-col items-center justify-center rounded-3xl border border-dashed py-24 text-center">
    <div className="bg-muted/30 mb-6 flex h-20 w-20 items-center justify-center rounded-2xl">
      <IconTag className="text-muted-foreground/40 size-10 stroke-1" />
    </div>
    <h3 className="text-foreground mb-2 text-lg font-bold tracking-tight">
      {tagsManagement.noTags}
    </h3>
    <p className="text-muted-foreground mb-8 text-sm font-medium tracking-tight">
      {tagsManagement.noTagsDescription}
    </p>
    <Button
      onClick={onCreateClick}
      className="h-12 gap-3 rounded-2xl px-8 font-bold shadow-sm transition-all hover:shadow-md active:scale-95"
    >
      <IconPlus className="size-4" />
      {tagsManagement.createFirstTag}
    </Button>
  </div>
);

export function TagsList({
  tags,
  isLoading,
  canDeleteTag,
  onCreateClick,
  onEdit,
  onDelete,
}: TagsListProps) {
  const { data: allTasks } = useAllTasks();
  const usage = useMemo(() => {
    const map = new Map<string, number>();
    for (const task of allTasks ?? []) {
      for (const id of task.tags ?? []) map.set(id, (map.get(id) ?? 0) + 1);
    }
    return map;
  }, [allTasks]);

  if (isLoading) {
    return <TagsListSkeleton />;
  }

  if (!tags || tags.length === 0) {
    return <EmptyState onCreateClick={onCreateClick} />;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {tags.map((tag) => (
        <div
          key={tag._id}
          data-testid="tag-card"
          className="border-border/60 bg-card hover:border-primary/40 flex items-center justify-between gap-3 rounded-xl border p-3 transition-colors"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="size-8 shrink-0 rounded-lg"
              style={{ backgroundColor: tag.color }}
              aria-hidden
            />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{tag.name}</div>
              <div className="text-muted-foreground mt-0.5 text-xs">
                {tagsManagement.usageCount.replace(
                  "{count}",
                  digitsEnToFa(usage.get(tag._id) ?? 0),
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-lg"
              onClick={() => onEdit(tag)}
              title={tagsManagement.editButton}
            >
              <IconPencil className="h-4 w-4" />
            </Button>
            {canDeleteTag ? (
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive size-8 rounded-lg"
                onClick={() => onDelete(tag)}
                title={tagsManagement.deleteButton}
              >
                <IconTrash className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
