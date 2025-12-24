import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/page-transition";
import { navigation, notFound, app } from "@/constants";
import { Link } from "react-router-dom";
import { IconTerminal, IconAlertTriangle } from "@tabler/icons-react";

export default function NotFound() {
  return (
    <PageTransition className="flex min-h-[80vh] flex-col items-center justify-center p-6 text-center">
      {/* Structural Decor */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(to right, var(--primary) 1px, transparent 1px), linear-gradient(to bottom, var(--primary) 1px, transparent 1px)`,
          backgroundSize: "100px 100px",
        }}
      />

      <div
        className="relative z-10 flex max-w-lg flex-col items-center gap-8"
        data-animate-stagger
      >
        <div className="flex flex-col items-center gap-4">
          <div className="bg-primary/10 text-primary border-primary/20 mb-4 flex h-24 w-24 items-center justify-center rounded-none border-2 shadow-[-8px_8px_0px_0px_rgba(var(--primary),0.1)]">
            <IconAlertTriangle className="size-12 stroke-[1.5]" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-3 opacity-40">
              <IconTerminal className="size-4" />
              <span className="text-[10px] font-black tracking-[0.4em] uppercase">
                Error_Code_404
              </span>
            </div>
            <h1 className="text-6xl font-black tracking-tighter uppercase">
              {app.name} — Lost
            </h1>
          </div>
        </div>

        <p className="text-muted-foreground text-center text-xs leading-relaxed font-bold tracking-[0.2em] uppercase">
          {notFound.message} :: THE SYSTEM COULD NOT LOCATE THE REQUESTED
          SECTOR.
        </p>

        <div className="flex items-center gap-4 pt-8" data-animate-stagger>
          <Button
            asChild
            className="h-14 rounded-none px-10 font-black shadow-[-4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:scale-95 dark:shadow-[-4px_4px_0px_0px_rgba(255,255,255,0.1)]"
          >
            <Link to="/" className="tracking-widest uppercase">
              {navigation.dashboard}
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-foreground bg-card h-14 rounded-none border-2 px-10 text-[10px] font-black tracking-widest uppercase shadow-[-4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:shadow-none"
          >
            <Link to="/projects">{navigation.projects}</Link>
          </Button>
        </div>
      </div>

      <div className="absolute top-12 start-12 hidden font-mono text-[8px] font-black tracking-[0.5em] uppercase opacity-10 lg:block">
        SECTOR_REGISTRY : CORRUPT
      </div>
      <div className="absolute end-12 bottom-12 hidden font-mono text-[8px] font-black tracking-[0.5em] uppercase opacity-10 lg:block">
        SYSTEM_STABILITY : MARGINAL
      </div>
    </PageTransition>
  );
}
