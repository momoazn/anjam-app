import { cn } from "@/lib/utils";

function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "bg-muted/50 text-muted-foreground border-b-2 border-border/40 pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded px-1.5 font-mono text-[10px] font-bold select-none shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

function KbdGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  );
}

export { Kbd, KbdGroup };
