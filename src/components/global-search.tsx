import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { common, navigation, search } from "@/constants";
import { useGlobalSearch } from "@/hooks/use-global-search";
import { useDebounce } from "use-debounce";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Folder,
  Loader2,
  Search,
  Terminal,
  Hash,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { digitsEnToFa } from "@persian-tools/persian-tools";

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
          "bg-muted/30 text-muted-foreground/60 border-border/40 hover:bg-muted/50 hover:text-foreground hover:border-primary/30 relative h-9 w-full justify-start rounded-none border font-mono text-[10px] tracking-widest uppercase shadow-none transition-all active:scale-[0.98] sm:pe-12 md:w-40 lg:w-64",
        )}
        onClick={() => setOpen(true)}
      >
        <span className="flex items-center gap-2">
          <Search className="h-3 w-3 opacity-40" />
          <span className="hidden lg:inline-flex">{search.placeholder}</span>
        </span>
        <kbd className="bg-primary/10 text-primary border-primary/20 pointer-events-none absolute start-[0.35rem] top-[0.35rem] hidden h-4 items-center gap-1 rounded-none border px-1 font-mono text-[8px] font-black tracking-tighter uppercase opacity-100 select-none sm:flex">
          <span className="text-[10px]">⌘</span>K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-foreground bg-card max-w-[600px] overflow-hidden rounded-none border-2 p-0 shadow-[-12px_12px_0px_0px_rgba(0,0,0,1)] transition-all dark:shadow-[-12px_12px_0px_0px_rgba(255,255,255,0.05)]">
          <div className="border-border/40 bg-muted/20 flex items-center justify-between border-b px-4 py-2">
            <div className="flex items-center gap-2">
              <Terminal className="text-primary size-3" />
              <span className="text-muted-foreground text-[9px] font-black tracking-[0.3em] uppercase">
                Command_Console
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 opacity-40">
                <Cpu className="size-2.5" />
                <span className="text-[8px] font-black uppercase">
                  Index: Sync
                </span>
              </div>
              <div className="bg-border/40 h-3 w-px" />
              <span className="text-primary/60 text-[8px] font-black uppercase">
                Buffer: {digitsEnToFa(query.length)}B
              </span>
            </div>
          </div>

          <Command
            shouldFilter={false}
            className="[&_[cmdk-group-heading]]:text-muted-foreground [&_[data-slot=command-input-wrapper]]:border-border/40 [&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[9px] [&_[cmdk-group-heading]]:font-black [&_[cmdk-group-heading]]:tracking-[0.2em] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group]]:px-2 [&_[cmdk-input]]:h-14 [&_[cmdk-item]]:rounded-none [&_[cmdk-item]]:px-4 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-4 [&_[cmdk-item]_svg]:w-4 [&_[data-slot=command-input-wrapper]]:h-14 [&_[data-slot=command-input-wrapper]]:border-b [&_[data-slot=command-input-wrapper]_svg]:h-4 [&_[data-slot=command-input-wrapper]_svg]:w-4"
          >
            <CommandInput
              placeholder={search.placeholder}
              value={query}
              onValueChange={setQuery}
              className="placeholder:text-muted-foreground/30 font-mono text-xs tracking-widest uppercase"
              showIcon={false}
            />

            <CommandList className="scrollbar-none divide-border/20 max-h-[400px] divide-y overflow-y-auto">
              {isLoading && (
                <div className="text-muted-foreground flex flex-col items-center justify-center p-12 text-sm">
                  <Loader2 className="text-primary h-6 w-6 animate-spin opacity-20" />
                  <span className="mt-4 text-[9px] font-black tracking-[0.3em] uppercase opacity-40">
                    {common.loading}
                  </span>
                </div>
              )}

              {!isLoading && !data && query.length > 0 && (
                <CommandEmpty className="flex flex-col items-center justify-center py-12 opacity-30 grayscale">
                  <Hash className="size-8 stroke-[1]" />
                  <p className="mt-4 text-[10px] font-black tracking-[0.2em] uppercase">
                    {common.messages.noData}
                  </p>
                </CommandEmpty>
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
                          className="group data-[selected=true]:border-primary data-[selected=true]:bg-primary/5 relative border-s-2 border-transparent transition-all"
                        >
                          <FileText className="text-muted-foreground/40 group-data-[selected=true]:text-primary ms-3 h-4 w-4" />
                          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <span className="group-data-[selected=true]:text-primary truncate text-sm font-bold tracking-tight">
                              {task.title}
                            </span>
                            <div className="text-muted-foreground/40 flex items-center gap-2 text-[9px] font-black tracking-wider uppercase">
                              <span className="text-primary/60 font-mono">
                                {task.display_id}
                              </span>
                              {task.project_name && (
                                <>
                                  <span className="opacity-20">•</span>
                                  <span className="truncate">
                                    {task.project_name}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="border-border/40 bg-muted/30 text-muted-foreground group-data-[selected=true]:border-primary/30 group-data-[selected=true]:text-primary ms-auto rounded-none px-1.5 py-0 text-[8px] font-black tracking-widest uppercase"
                          >
                            {task.status}
                          </Badge>
                        </CommandItem>
                      ))}
                    </CommandGroup>
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
                          className="group data-[selected=true]:border-primary data-[selected=true]:bg-primary/5 relative border-s-2 border-transparent transition-all"
                        >
                          <Folder className="text-muted-foreground/40 group-data-[selected=true]:text-primary ms-3 h-4 w-4" />
                          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <span className="group-data-[selected=true]:text-primary truncate text-sm font-bold tracking-tight">
                              {project.name}
                            </span>
                            <span className="text-muted-foreground/40 mt-0.5 font-mono text-[9px] leading-none font-black tracking-widest uppercase">
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
                      <CommandEmpty className="flex flex-col items-center justify-center py-12 opacity-30 grayscale">
                        <Hash className="size-8 stroke-[1]" />
                        <p className="mt-4 text-[10px] font-black tracking-[0.2em] uppercase">
                          {common.messages.noData}
                        </p>
                      </CommandEmpty>
                    )}
                </>
              )}
            </CommandList>

            <div className="border-border/40 bg-muted/10 text-muted-foreground/40 flex items-center justify-between border-t px-4 py-2 text-[8px] font-black tracking-widest uppercase">
              <div className="flex gap-4">
                <span className="flex items-center gap-1.5">
                  <Terminal className="size-2.5" /> Select
                </span>
                <span className="flex items-center gap-1.5">
                  <Hash className="size-2.5" /> Scroll
                </span>
              </div>
              <span>ESC to Close</span>
            </div>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
