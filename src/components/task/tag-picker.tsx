import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useTags } from "@/hooks/tags";
import type { TagsResponse } from "@/lib/pocketbase-types";
import { tagsManagement, tasks } from "@/constants";
import { digitsEnToFa } from "@persian-tools/persian-tools";

interface TagPickerProps {
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
  placeholder?: string;
}

export function TagPicker({
  selectedTagIds,
  onChange,
  placeholder = tasks.filters.tag,
}: TagPickerProps) {
  const [open, setOpen] = useState(false);
  const { data: tags, isLoading } = useTags();

  const selectedTags =
    tags?.filter((tag) => selectedTagIds.includes(tag.id)) || [];

  const handleSelect = (tag: TagsResponse) => {
    const isSelected = selectedTagIds.includes(tag.id);
    if (isSelected) {
      onChange(selectedTagIds.filter((id) => id !== tag.id));
    } else {
      onChange([...selectedTagIds, tag.id]);
    }
  };

  const handleRemove = (tagId: string) => {
    onChange(selectedTagIds.filter((id) => id !== tagId));
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <span className="truncate">
              {selectedTags.length > 0
                ? `${digitsEnToFa(selectedTags.length)} ${tasks.filters.tag}`
                : placeholder}
            </span>
            <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder={tasks.filters.search} className="h-9" />
            <CommandEmpty>
              {isLoading ? tagsManagement.loading : tagsManagement.noTags}
            </CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {tags?.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <CommandItem
                    key={tag.id}
                    value={tag.name}
                    onSelect={() => handleSelect(tag)}
                  >
                    <div className="flex flex-1 items-center gap-2">
                      <div
                        className="h-4 w-4 rounded"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span>{tag.name}</span>
                    </div>
                    <Check
                      className={cn(
                        "ms-auto h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected tags display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag.id}
              style={{
                backgroundColor: tag.color,
                color: "#FFFFFF",
                border: "none",
              }}
              className="gap-1 pe-1"
            >
              {tag.name}
              <button
                type="button"
                onClick={() => handleRemove(tag.id)}
                className="ms-1 rounded-none p-0.5 transition-colors hover:bg-black/20"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
