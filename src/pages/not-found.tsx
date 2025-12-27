import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/page-transition";
import { navigation, notFound, app } from "@/constants";
import { Link } from "react-router-dom";
import { IconAlertTriangle, IconSearch } from "@tabler/icons-react";

export default function NotFound() {
  return (
    <PageTransition className="flex min-h-[80vh] flex-col items-center justify-center p-6 text-center">
      <div
        className="relative z-10 flex max-w-lg flex-col items-center gap-8"
        data-animate-stagger
      >
        <div className="flex flex-col items-center gap-4">
          <div className="bg-primary/10 text-primary flex h-24 w-24 items-center justify-center rounded-full shadow-sm">
            <IconAlertTriangle className="size-12 stroke-[1.5]" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-3 opacity-40">
              <IconSearch className="size-4" />
              <span className="text-xs font-semibold tracking-wider uppercase">
                Error 404
              </span>
            </div>
            <h1 className="text-5xl font-bold tracking-tight">
              {app.name} — Lost
            </h1>
          </div>
        </div>

        <p className="text-muted-foreground text-center text-sm leading-relaxed font-medium">
          {notFound.message}
        </p>

        <div className="flex items-center gap-4 pt-8" data-animate-stagger>
          <Button asChild className="h-12 px-8 font-bold shadow-sm">
            <Link to="/dashboard">{navigation.dashboard}</Link>
          </Button>
          <Button asChild variant="outline" className="h-12 px-8 font-bold">
            <Link to="/projects">{navigation.projects}</Link>
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}
