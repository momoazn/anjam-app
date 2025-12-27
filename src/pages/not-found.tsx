import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/page-transition";
import { navigation, notFound, app } from "@/constants";
import { Link } from "react-router-dom";
import { IconAlertTriangle, IconSearch } from "@tabler/icons-react";

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
          <div className="bg-primary/10 text-primary border-primary/20 mb-4 flex h-24 w-24 items-center justify-center rounded-none border shadow-sm">
            <IconAlertTriangle className="size-12 stroke-[1.5]" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-3 opacity-40">
              <IconSearch className="size-4" />
              <span className="text-[10px] font-black tracking-tight uppercase">
                Error 404
              </span>
            </div>
            <h1 className="text-6xl font-black tracking-tighter uppercase">
              {app.name} — Lost
            </h1>
          </div>
        </div>

        <p className="text-muted-foreground text-center text-xs leading-relaxed font-bold tracking-tight uppercase">
          {notFound.message} :: The requested page could not be located.
        </p>

        <div className="flex items-center gap-4 pt-8" data-animate-stagger>
          <Button
            asChild
            className="h-14 rounded-none px-10 font-black shadow-sm transition-all active:scale-95"
          >
            <Link to="/dashboard" className="tracking-tight uppercase">
              {navigation.dashboard}
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-border bg-card h-14 rounded-none border px-10 text-[10px] font-black tracking-tight uppercase shadow-sm transition-all active:shadow-none"
          >
            <Link to="/projects">{navigation.projects}</Link>
          </Button>
        </div>
      </div>

      <div className="absolute start-12 top-12 hidden font-mono text-[8px] font-black tracking-tight uppercase opacity-10 lg:block">
        ERROR_CODE : 404
      </div>
      <div className="absolute end-12 bottom-12 hidden font-mono text-[8px] font-black tracking-tight uppercase opacity-10 lg:block">
        STATUS : LOST
      </div>
    </PageTransition>
  );
}
