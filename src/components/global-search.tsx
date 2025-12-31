import { IconActivity, IconHash, IconTarget } from "@tabler/icons-react";
import { FileText, Folder, Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "use-debounce";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { common, search } from "@/constants";
import { useGlobalSearch } from "@/hooks/use-global-search";
import { cn } from "@/lib/utils";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 500);
  const navigate = useNavigate();

  const { data, isLoading } = useGlobalSearch(debouncedQuery);
  const taskResults = data?.tasks ?? [];
  const projectResults = data?.projects ?? [];
  const hasResults = taskResults.length > 0 || projectResults.length > 0;

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
          "bg-muted/50 hover:bg-muted relative h-10 w-full justify-start rounded-lg border px-4 font-medium transition-all md:w-48 lg:w-72",
        )}
        onClick={() => setOpen(true)}
      >
        <span className="flex items-center gap-3">
          <Search className="text-muted-foreground size-4" />
          <span className="text-muted-foreground hidden text-sm lg:inline-flex">
            {search.placeholder}
          </span>
        </span>
        <kbd className="bg-background text-muted-foreground absolute end-2 top-2 hidden h-6 items-center gap-1 rounded-md border px-1.5 font-mono text-[10px] font-medium select-none sm:flex">
          <span className="text-[12px]">⌘</span>K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl overflow-hidden rounded-xl border p-0 shadow-2xl">
          <DialogTitle className="sr-only">{search.title}</DialogTitle>
          <Command
            shouldFilter={false}
            className="**:[[cmdk-group-heading]]:text-muted-foreground bg-transparent **:[[cmdk-group-heading]]:px-4 **:[[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-input-wrapper]]:h-14 [&_[cmdk-input-wrapper]]:border-b [&_[cmdk-input]]:text-base [&_[cmdk-input]]:font-medium"
          >
            <div className="relative flex items-center px-4">
              <Search className="text-muted-foreground/50 mr-3 size-5" />
              <CommandInput
                placeholder={search.placeholder}
                value={query}
                onValueChange={setQuery}
                className="h-14 w-full bg-transparent outline-none"
              />
            </div>

            <CommandList className="scrollbar-none max-h-100 overflow-y-auto p-2">
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="text-primary/40 size-8 animate-spin" />
                  <span className="text-muted-foreground mt-3 text-xs font-medium">
                    {common.loading}
                  </span>
                </div>
              )}

              {!isLoading && query.length >= 2 && !hasResults && (
                <CommandEmpty className="flex flex-col items-center justify-center py-12">
                  <IconHash className="text-muted-foreground/20 size-10" />
                  <p className="text-muted-foreground mt-3 text-sm font-medium">
                    {common.messages.noData}
                  </p>
                </CommandEmpty>
              )}

              {data && hasResults && (
                <div className="space-y-1">
                  {taskResults.length > 0 && (
                    <CommandGroup heading={search.tasks}>
                      {taskResults.map((task) => (
                        <CommandItem
                          key={task.id}
                          value={`task-${task.id}`}
                          onSelect={() =>
                            handleSelectRequest(`/tasks/${task.id}`)
                          }
                          className="group data-[selected=true]:bg-primary/5 flex cursor-pointer items-center gap-3 rounded-lg p-2.5 transition-all"
                        >
                          <div className="bg-muted flex size-9 items-center justify-center rounded-lg transition-transform group-data-[selected=true]:scale-105">
                            <FileText className="text-muted-foreground group-data-[selected=true]:text-primary size-4" />
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground/60 text-[10px] font-bold">
                                {task.display_id}
                              </span>
                              {task.project_name && (
                                <div className="text-primary/60 flex items-center gap-1">
                                  <IconTarget className="size-3" />
                                  <span className="text-[10px] font-bold">
                                    {task.project_name}
                                  </span>
                                </div>
                              )}
                            </div>
                            <span className="group-data-[selected=true]:text-primary truncate text-sm font-bold">
                              {task.title}
                            </span>
                          </div>
                          <Badge
                            variant="secondary"
                            className="rounded-md px-2 py-0.5 text-[10px] font-bold"
                          >
                            {task.status}
                          </Badge>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  {projectResults.length > 0 && (
                    <CommandGroup heading={search.projects}>
                      {projectResults.map((project) => (
                        <CommandItem
                          key={project.id}
                          value={`project-${project.id}`}
                          onSelect={() =>
                            handleSelectRequest(
                              `/projects/${project.id}/details`,
                            )
                          }
                          className="group data-[selected=true]:bg-primary/5 flex cursor-pointer items-center gap-3 rounded-lg p-2.5 transition-all"
                        >
                          <div className="bg-muted flex size-9 items-center justify-center rounded-lg transition-transform group-data-[selected=true]:scale-105">
                            <Folder className="text-muted-foreground group-data-[selected=true]:text-primary size-4" />
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col">
                            <div className="text-muted-foreground/60 flex items-center gap-2">
                              <IconHash className="size-3" />
                              <span className="text-[10px] font-bold">
                                {project.code}
                              </span>
                            </div>
                            <span className="group-data-[selected=true]:text-primary truncate text-sm font-bold">
                              {project.name}
                            </span>
                          </div>
                          <IconActivity className="text-muted-foreground/30 size-4" />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </div>
              )}
            </CommandList>

            <div className="bg-muted/30 flex items-center justify-between border-t px-4 py-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <kbd className="bg-background flex h-5 items-center rounded border px-1.5 font-mono text-[10px] font-bold">
                    ENTER
                  </kbd>
                  <span className="text-muted-foreground text-[10px] font-bold">
                    {search.select}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <kbd className="bg-background flex h-5 items-center rounded border px-1.5 font-mono text-[10px] font-bold">
                    ESC
                  </kbd>
                  <span className="text-muted-foreground text-[10px] font-bold">
                    {search.close}
                  </span>
                </div>
              </div>
              <span className="text-muted-foreground/40 text-[10px] font-bold">
                {search.globalSearch}
              </span>
            </div>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
