import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { projects } from "@/constants";
import { pb } from "@/lib/pocketbase";
import { ProjectsResponse } from "@/lib/pocketbase-types";
import { cn } from "@/lib/utils";
import { Download, FileIcon } from "lucide-react";

type ProjectAssetsProps = {
  project: ProjectsResponse;
  className?: string;
};

export function ProjectAssets({ project, className }: ProjectAssetsProps) {
  const assets = project.assets || [];

  if (assets.length === 0) {
    return (
      <Card
        className={cn(
          "rounded-2xl p-6",
          className,
        )}
      >
        <div className="text-muted-foreground text-center">
          <FileIcon className="mx-auto mb-2 h-12 w-12 opacity-50" />
          <p>{projects.details.noFiles}</p>
        </div>
      </Card>
    );
  }

  const getFileUrl = (filename: string): string => {
    return pb.files.getUrl(project, filename);
  };

  const getThumbnailUrl = (filename: string): string => {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) {
      return pb.files.getUrl(project, filename, { thumb: "100x100" });
    }
    return "";
  };

  const handleDownload = async (filename: string) => {
    const url = getFileUrl(filename);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isImage = (filename: string): boolean => {
    const ext = filename.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "");
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {assets.map((filename, index) => {
          const thumbnailUrl = getThumbnailUrl(filename);
          const fileUrl = getFileUrl(filename);

          return (
            <Card
              key={`${filename}-${index}`}
              className="overflow-hidden rounded-2xl transition-shadow hover:shadow-md"
            >
              {/* Preview Area */}
              {isImage(filename) && thumbnailUrl ? (
                <div className="bg-muted flex aspect-video items-center justify-center overflow-hidden">
                  <img
                    src={thumbnailUrl}
                    alt={filename}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="bg-muted flex aspect-video items-center justify-center">
                  <div className="text-center">
                    <div className="mb-2 text-6xl">
                      {getFileExtensionIcon(filename)}
                    </div>
                    <p className="text-muted-foreground text-xs font-bold">
                      {filename.split(".").pop()}
                    </p>
                  </div>
                </div>
              )}

              {/* File Info */}
              <div className="p-4">
                <p className="mb-3 truncate text-sm font-bold" title={filename}>
                  {filename}
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-xl"
                    onClick={() => handleDownload(filename)}
                  >
                    <Download className="me-2 h-4 w-4" />
                    {projects.files.download}
                  </Button>
                  {isImage(filename) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-xl"
                      onClick={() => window.open(fileUrl, "_blank")}
                    >
                      {projects.files.preview}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function getFileExtensionIcon(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return "📄";
    case "doc":
    case "docx":
      return "📝";
    case "xls":
    case "xlsx":
    case "csv":
      return "📊";
    case "ppt":
    case "pptx":
      return "📽️";
    case "json":
      return "📋";
    case "xml":
      return "📰";
    case "txt":
      return "📃";
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "webp":
    case "svg":
      return "🖼️";
    default:
      return "📎";
  }
}
