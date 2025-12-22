import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/page-transition";
import { navigation, notFound } from "@/constants";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <PageTransition className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex flex-col items-center gap-2" data-animate-stagger>
        <h1 className="text-2xl font-semibold" data-interactive-pulse>
          404
        </h1>
        <p className="text-muted-foreground text-sm">{notFound.message}</p>
      </div>
      <div className="flex items-center gap-2" data-animate-stagger>
        <Button asChild>
          <Link to="/">{navigation.dashboard}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/projects">{navigation.projects}</Link>
        </Button>
      </div>
    </PageTransition>
  );
}
