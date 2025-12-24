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
  <div className="bg-border/40 border-border/40 grid grid-cols-2 gap-px border md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
      <div key={i} className="bg-card space-y-3 p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20 rounded-none" />
          <Skeleton className="h-4 w-4 rounded-none" />
        </div>
        <Skeleton className="h-2 w-full rounded-none" />
      </div>
    ))}
  </div>
);

const EmptyState = ({ onCreateClick }: { onCreateClick: () => void }) => (
  <div className="border-border/40 flex flex-col items-center justify-center border-2 border-dashed py-24 text-center opacity-30 grayscale">
    <div className="border-foreground/40 mb-6 flex h-20 w-20 items-center justify-center border-2">
      <IconTag className="size-10 stroke-[1]" />
    </div>
    <h3 className="text-foreground mb-2 text-lg font-black tracking-widest uppercase">
      {tagsManagement.noTags}
    </h3>
    <p className="text-muted-foreground mb-8 text-xs font-bold tracking-widest uppercase">
      {tagsManagement.noTagsDescription}
    </p>
    <Button
      onClick={onCreateClick}
      className="h-12 gap-3 rounded-none px-8 font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:scale-95 dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]"
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
      className="bg-border/40 border-border/40 grid grid-cols-2 gap-px border md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      data-animate-stagger
    >
      {tags.map((tag) => (
        <div
          key={tag.id}
          className="group bg-card hover:bg-muted/30 relative overflow-hidden p-4 text-right transition-all"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 opacity-40">
              <IconHash className="size-3" />
              <span className="font-mono text-[9px] font-black tracking-widest uppercase">
                {tag.id.slice(0, 6)}
              </span>
            </div>
            <div
              className="border-foreground/10 h-3 w-3 border shadow-sm"
              style={{ backgroundColor: tag.color }}
            />
          </div>

          <h3 className="mb-6 truncate text-sm font-black tracking-tight uppercase">
            {tag.name}
          </h3>

          <div className="flex translate-y-1 items-center justify-end gap-1 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-primary/10 hover:text-primary h-8 w-8 rounded-none"
              onClick={() => onEdit(tag)}
              title={tagsManagement.editButton}
            >
              <IconPencil className="h-4 w-4" />
            </Button>
            {canDeleteTag && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-none text-rose-500 hover:bg-rose-500/10"
                onClick={() => onDelete(tag)}
                title={tagsManagement.deleteButton}
              >
                <IconTrash className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="bg-primary absolute right-0 bottom-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full" />
        </div>
      ))}
    </div>
  );
}
