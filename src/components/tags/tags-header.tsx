import { Plus, Tag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { tagsManagement } from "@/constants";
import type { Tag as TagType } from "@/hooks/tags";

type TagsHeaderProps = {
  tags: TagType[] | undefined;
  onCreateClick: () => void;
};

export function TagsHeader({ tags, onCreateClick }: TagsHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
          <Tag className="h-5 w-5 md:h-6 md:w-6" />
          {tagsManagement.title}
        </h1>
        <p className="text-muted-foreground mt-2">
          {tags && tags.length > 0
            ? tagsManagement.tagsCount.replace(
                "{count}",
                tags.length.toString(),
              )
            : tagsManagement.description}
        </p>
      </div>
      <Button className="gap-2" size="lg" onClick={onCreateClick}>
        <Plus className="h-4 w-4" />
        {tagsManagement.addTag}
      </Button>
    </div>
  );
}
