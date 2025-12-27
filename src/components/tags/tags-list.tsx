import {
  IconPencil,
  IconPlus,
  IconTag,
  IconTrash,
  IconHash,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { tagsManagement } from "@/constants";
import type { TagsResponse } from "@/lib/pocketbase-types";

type TagsListProps = {
  tags: TagsResponse[] | undefined;
  isLoading: boolean;
  canDeleteTag: boolean;
  onCreateClick: () => void;
  onEdit: (tag: TagsResponse) => void;
  onDelete: (tag: TagsResponse) => void;
};

const TagsListSkeleton = () => (
  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
      <div
        key={i}
        className="bg-card border-border/40 rounded-[var(--ds-radius-card)] border p-4 shadow-sm"
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
  <div className="border-border/40 flex flex-col items-center justify-center rounded-[var(--ds-radius-heroHeader)] border border-dashed py-24 text-center">
    <div className="bg-muted/30 mb-6 flex h-20 w-20 items-center justify-center rounded-[var(--ds-radius-card)]">
      <IconTag className="text-muted-foreground/40 size-10 stroke-[1]" />
    </div>
    <h3 className="text-foreground mb-2 text-lg font-bold tracking-tight">
      {tagsManagement.noTags}
    </h3>
    <p className="text-muted-foreground mb-8 text-sm font-medium tracking-tight">
      {tagsManagement.noTagsDescription}
    </p>
    <Button
      onClick={onCreateClick}
      className="h-[var(--ds-sizing-formControlHeight)] gap-3 rounded-[var(--ds-radius-card)] px-8 font-bold shadow-sm transition-all hover:shadow-md active:scale-95"
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
  if (isLoading) {
    return <TagsListSkeleton />;
  }

  if (!tags || tags.length === 0) {
    return <EmptyState onCreateClick={onCreateClick} />;
  }

  return (
    <div
      className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      data-animate-stagger
    >
      {tags.map((tag) => (
        <div
          key={tag.id}
          className="group bg-card border-border/40 hover:border-primary/20 relative overflow-hidden rounded-[var(--ds-radius-card)] border p-4 transition-all hover:shadow-md"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 opacity-40">
              <IconHash className="size-3" />
              <span className="font-mono text-[9px] font-bold tracking-tight">
                {tag.id.slice(0, 6)}
              </span>
            </div>
            <div
              className="h-3 w-3 rounded-full shadow-sm"
              style={{ backgroundColor: tag.color }}
            />
          </div>

          <h3 className="mb-6 truncate text-sm font-bold tracking-tight">
            {tag.name}
          </h3>

          <div className="flex items-center gap-1 opacity-0 transition-all group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-primary/10 hover:text-primary h-8 w-8 rounded-xl"
              onClick={() => onEdit(tag)}
              title={tagsManagement.editButton}
            >
              <IconPencil className="h-4 w-4" />
            </Button>
            {canDeleteTag && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-xl text-rose-500 hover:bg-rose-500/10"
                onClick={() => onDelete(tag)}
                title={tagsManagement.deleteButton}
              >
                <IconTrash className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
