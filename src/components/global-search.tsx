import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { common, navigation, search } from "@/constants";
import { useGlobalSearch } from "@/hooks/use-global-search";
import { useDebounce } from "use-debounce";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { FileText, Folder, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 500);
  const navigate = useNavigate();

  const { data, isLoading } = useGlobalSearch(debouncedQuery);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelectRequest = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "bg-muted/50 text-muted-foreground relative h-9 w-full justify-start rounded-[0.5rem] text-sm font-normal shadow-none sm:pr-12 md:w-40 lg:w-64",
        )}
        onClick={() => setOpen(true)}
      >
        <span className="hidden lg:inline-flex">{search.placeholder}</span>
        <span className="inline-flex lg:hidden">
          <Search className="h-4 w-4" />
        </span>
        <kbd className="bg-muted pointer-events-none absolute top-[0.3rem] left-[0.3rem] hidden h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[550px] overflow-hidden p-0">
          <Command
            shouldFilter={false}
            className="[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5 [&_[data-slot=command-input-wrapper]]:h-12 [&_[data-slot=command-input-wrapper]_svg]:h-5 [&_[data-slot=command-input-wrapper]_svg]:w-5"
          >
            <CommandInput
              placeholder={search.placeholder}
              value={query}
              onValueChange={setQuery}
            />
            <CommandList className="max-h-[300px] overflow-y-auto">
              {isLoading && (
                <div className="text-muted-foreground flex items-center justify-center p-4 text-sm">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {common.loading}
                </div>
              )}

              {!isLoading && !data && query.length > 0 && (
                <CommandEmpty>{common.messages.noData}</CommandEmpty>
              )}

              {data && (
                <>
                  {data.tasks.length > 0 && (
                    <CommandGroup heading={navigation.tasks}>
                      {data.tasks.map((task) => (
                        <CommandItem
                          key={task.id}
                          value={`task-${task.id}`}
                          onSelect={() =>
                            handleSelectRequest(`/tasks/${task.id}`)
                          }
                        >
                          <FileText className="ml-2 h-4 w-4" />
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium">{task.title}</span>
                            <div className="text-muted-foreground flex items-center gap-2 text-xs">
                              <span>{task.display_id}</span>
                              {task.project_name && (
                                <>
                                  <span>•</span>
                                  <span>{task.project_name}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <Badge
                            variant="secondary"
                            className="mr-auto text-xs"
                          >
                            {task.status}
                          </Badge>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  {data.tasks.length > 0 && data.projects.length > 0 && (
                    <CommandSeparator />
                  )}

                  {data.projects.length > 0 && (
                    <CommandGroup heading={navigation.projects}>
                      {data.projects.map((project) => (
                        <CommandItem
                          key={project.id}
                          value={`project-${project.id}`}
                          onSelect={() =>
                            handleSelectRequest(
                              `/projects/${project.id}/details`,
                            )
                          }
                        >
                          <Folder className="ml-2 h-4 w-4" />
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium">{project.name}</span>
                            <span className="text-muted-foreground text-xs">
                              {project.code}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  {data.tasks.length === 0 &&
                    data.projects.length === 0 &&
                    query.length >= 2 &&
                    !isLoading && (
                      <CommandEmpty>{common.messages.noData}</CommandEmpty>
                    )}
                </>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
