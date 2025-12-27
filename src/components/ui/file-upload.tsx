import { Button } from "@/components/ui/button";
import { projects } from "@/constants";
import { FileWithPreview, useFileUpload } from "@/hooks/use-file-upload";
import { cn } from "@/lib/utils";
import {
  IconUpload,
  IconX,
  IconFile,
  IconPhoto,
  IconFileText,
  IconFileZip,
} from "@tabler/icons-react";
import { useCallback } from "react";
import { toast } from "sonner";
import { BlueprintPattern } from "@/components/design-system/blueprint-pattern";

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
  const { validateFile, formatFileSize } = useFileUpload({
    maxSize,
    maxFiles,
  });

  const getTablerIcon = (file: File) => {
    if (file.type.startsWith("image/")) return <IconPhoto className="size-6" />;
    if (file.type.includes("zip") || file.type.includes("rar"))
      return <IconFileZip className="size-6" />;
    if (file.type.includes("pdf") || file.type.includes("text"))
      return <IconFileText className="size-6" />;
    return <IconFile className="size-6" />;
  };

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
    <div className={cn("space-y-6", className)}>
      {/* Dropzone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={cn(
          "relative overflow-hidden border-4 border-dashed p-10 text-center transition-all duration-200",
          disabled
            ? "border-foreground/10 bg-foreground/5 cursor-not-allowed"
            : "border-foreground/20 bg-foreground/[0.02] hover:border-foreground hover:bg-foreground/[0.04] cursor-pointer",
        )}
      >
        <BlueprintPattern opacity={0.03} />
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
            "relative z-10 flex flex-col items-center gap-4",
            disabled ? "cursor-not-allowed" : "cursor-pointer",
          )}
        >
          <div className="bg-foreground text-background flex h-16 w-16 items-center justify-center">
            <IconUpload className="size-8" stroke={3} />
          </div>
          <div className="space-y-1">
            <p className="text-foreground text-lg font-black tracking-tighter uppercase">
              {projects.files.dropzone}
            </p>
            <div className="text-muted-foreground flex flex-wrap justify-center gap-x-4 gap-y-1 font-mono text-[10px] font-bold tracking-widest uppercase">
              <span>MAX_SIZE: {formatFileSize(maxSize)}</span>
              <span>ALLOWED: PDF, DOC, IMG, ZIP</span>
            </div>
          </div>
        </label>
      </div>

      {/* File List */}
      {value.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {value.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="group border-foreground/10 bg-background hover:border-foreground relative flex items-center gap-4 border-2 p-3 transition-all"
            >
              {/* Preview or Icon */}
              <div className="border-foreground/5 bg-foreground/5 flex h-12 w-12 shrink-0 items-center justify-center border-2">
                {file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-foreground/40">
                    {getTablerIcon(file)}
                  </div>
                )}
              </div>

              {/* File Info */}
              <div className="min-w-0 flex-1 text-right">
                <p className="text-foreground truncate text-xs font-black tracking-tight uppercase">
                  {file.name}
                </p>
                <p className="text-muted-foreground font-mono text-[10px] font-bold">
                  {formatFileSize(file.size)}
                </p>
              </div>

              {/* Remove Button */}
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleRemove(index)}
                disabled={disabled}
                className="border-foreground/10 hover:border-destructive hover:bg-destructive hover:text-destructive-foreground h-8 w-8 shrink-0 rounded-none border-2"
              >
                <IconX className="size-4" stroke={3} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
