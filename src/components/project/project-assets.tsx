import { FileIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { projects } from "@/constants";
import { cn } from "@/lib/utils";

type ProjectAssetsProps = {
  className?: string;
};

export function ProjectAssets({ className }: ProjectAssetsProps) {
  // Convex migration: Assets are not yet supported in v1 schema
  const assets: string[] = [];

  if (assets.length === 0) {
    return (
      <Card className={cn("rounded-2xl p-6", className)}>
        <div className="text-muted-foreground text-center">
          <FileIcon className="mx-auto mb-2 h-12 w-12 opacity-50" />
          <p>{projects.files.noFiles}</p>
        </div>
      </Card>
    );
  }

  return null;
}
