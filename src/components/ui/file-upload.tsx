import { Button } from "@/components/ui/button";
import { projects } from "@/constants";
import { FileWithPreview, useFileUpload } from "@/hooks/use-file-upload";
import { cn } from "@/lib/utils";
import { Upload, X } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";

type FileUploadProps = {
  value?: FileWithPreview[];
  onChange?: (files: FileWithPreview[]) => void;
  maxSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
};

export function FileUpload({
  value = [],
  onChange,
  maxSize = 52428800,
  maxFiles,
  disabled = false,
  className,
}: FileUploadProps) {
  const { validateFile, formatFileSize, getFileIcon } = useFileUpload({
    maxSize,
    maxFiles,
  });

  const handleAddFiles = useCallback(
    (fileList: FileList) => {
      const fileArray = Array.from(fileList);

      if (maxFiles && value.length + fileArray.length > maxFiles) {
        toast.error(
          projects.files.validation.maxFiles.replace(
            "{maxFiles}",
            String(maxFiles),
          ),
        );
        return;
      }

      const validFiles: FileWithPreview[] = [];
      const errors: string[] = [];

      fileArray.forEach((file) => {
        const validation = validateFile(file);
        if (validation.valid) {
          const fileWithPreview = file as FileWithPreview;
          if (file.type.startsWith("image/")) {
            fileWithPreview.preview = URL.createObjectURL(file);
          }
          validFiles.push(fileWithPreview);
        } else {
          errors.push(`${file.name}: ${validation.error}`);
        }
      });

      if (errors.length > 0) {
        errors.forEach((error) => toast.error(error));
      }

      if (validFiles.length > 0) {
        onChange?.([...value, ...validFiles]);
      }
    },
    [value, maxFiles, validateFile, onChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;

      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles.length > 0) {
        handleAddFiles(droppedFiles);
      }
    },
    [disabled, handleAddFiles],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      if (selectedFiles && selectedFiles.length > 0) {
        handleAddFiles(selectedFiles);
      }
      // Reset input value to allow selecting the same file again
      e.target.value = "";
    },
    [handleAddFiles],
  );

  const handleRemove = useCallback(
    (index: number) => {
      const newFiles = [...value];
      const removed = newFiles.splice(index, 1)[0];
      if (removed.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      onChange?.(newFiles);
    },
    [value, onChange],
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Dropzone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={cn(
          "rounded-none border border-dashed p-8 text-center transition-colors",
          disabled
            ? "border-muted bg-muted/20 cursor-not-allowed"
            : "border-muted-foreground/25 hover:border-muted-foreground/50 cursor-pointer",
        )}
      >
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          disabled={disabled}
          className="hidden"
          id="file-upload-input"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt,.json,.xml,image/*,text/*"
        />
        <label
          htmlFor="file-upload-input"
          className={cn(
            "flex flex-col items-center gap-2",
            disabled ? "cursor-not-allowed" : "cursor-pointer",
          )}
        >
          <Upload className="text-muted-foreground h-10 w-10" />
          <div className="text-muted-foreground text-sm">
            <span className="text-foreground font-medium">
              {projects.files.dropzone}
            </span>
          </div>
          <div className="text-muted-foreground text-xs">
            {projects.files.maxSize.replace("{size}", formatFileSize(maxSize))}
          </div>
          <div className="text-muted-foreground text-xs">
            {projects.files.allowedTypes}
          </div>
        </label>
      </div>

      {/* File List */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="bg-muted/50 flex items-center gap-3 rounded-none p-3"
            >
              {/* Preview or Icon */}
              {file.preview ? (
                <img
                  src={file.preview}
                  alt={file.name}
                  className="h-12 w-12 rounded object-cover"
                />
              ) : (
                <div className="bg-muted flex h-12 w-12 items-center justify-center rounded">
                  <span className="text-2xl">{getFileIcon(file)}</span>
                </div>
              )}

              {/* File Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-muted-foreground text-xs">
                  {formatFileSize(file.size)}
                </p>
              </div>

              {/* Remove Button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(index)}
                disabled={disabled}
                className="h-8 w-8 shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
