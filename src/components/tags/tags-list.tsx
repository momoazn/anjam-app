import { Pencil, Plus, Tag as TagIcon, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

const EmptyState = ({ onCreateClick }: { onCreateClick: () => void }) => (
  <Card className="border-dashed">
    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
      <div
        className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-full"
        data-interactive-pulse
      >
        <TagIcon className="text-primary h-6 w-6" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">{tagsManagement.noTags}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        {tagsManagement.noTagsDescription}
      </p>
      <Button className="gap-2" onClick={onCreateClick}>
        <Plus className="h-4 w-4" />
        {tagsManagement.createFirstTag}
      </Button>
    </CardContent>
  </Card>
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
    <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {tags.map((tag) => (
        <Card
          key={tag.id}
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => onEdit(tag)}
        >
          <CardContent className="flex items-center justify-between p-2">
            <div className="flex min-w-0 items-center gap-2">
              <div
                className="h-5 w-5 flex-shrink-0 rounded"
                style={{ backgroundColor: tag.color }}
              />
              <p className="truncate text-sm font-medium">{tag.name}</p>
            </div>
            <div className="flex flex-shrink-0 gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(tag);
                }}
                title={tagsManagement.editButton}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              {canDeleteTag && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete(tag);
                  }}
                  title={tagsManagement.deleteButton}
                >
                  <Trash2 className="text-destructive h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
