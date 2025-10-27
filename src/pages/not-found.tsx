import { Button } from "@/components/ui/button";
import { fa } from "@/constants/text";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl font-semibold">404</h1>
        <p className="text-muted-foreground text-sm">{fa.notFound.message}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button asChild>
          <Link to="/">{fa.navigation.dashboard}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/projects">{fa.navigation.projects}</Link>
        </Button>
      </div>
    </div>
  );
}
