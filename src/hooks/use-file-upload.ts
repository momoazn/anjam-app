import { fa } from "@/constants/text";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export type FileUploadOptions = {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  maxFiles?: number;
  onUploadComplete?: (files: File[]) => void;
  onError?: (error: string) => void;
};

export type FileWithPreview = File & {
  preview?: string;
};

const DEFAULT_MAX_SIZE = 52428800; // 50MB
const DEFAULT_ALLOWED_TYPES = [
  "application/pdf",
  "image/*",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/*",
  "text/csv",
  "application/csv",
  "text/plain",
  "application/json",
  "application/xml",
  "text/xml",
];

export function useFileUpload(options?: FileUploadOptions) {
  const {
    maxSize = DEFAULT_MAX_SIZE,
    allowedTypes = DEFAULT_ALLOWED_TYPES,
    maxFiles,
    onUploadComplete,
    onError,
  } = options ?? {};

  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);

  const validateFile = useCallback(
    (file: File): { valid: boolean; error?: string } => {
      // Check file size
      if (file.size > maxSize) {
        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
        return {
          valid: false,
          error: fa.projects.files.validation.tooLarge.replace(
            "{max}",
            `${maxSizeMB}MB`,
          ),
        };
      }

      // Check file type
      const fileType = file.type;
      const isAllowed = allowedTypes.some((allowedType) => {
        if (allowedType.endsWith("/*")) {
          const baseType = allowedType.split("/")[0];
          return fileType.startsWith(baseType + "/");
        }
        return fileType === allowedType;
      });

      if (!isAllowed) {
        return {
          valid: false,
          error: fa.projects.files.validation.invalidType.replace(
            "{fileName}",
            file.name,
          ),
        };
      }

      return { valid: true };
    },
    [maxSize, allowedTypes],
  );

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles);

      // Check max files limit
      if (maxFiles && files.length + fileArray.length > maxFiles) {
        const error = fa.projects.files.validation.maxFiles.replace(
          "{maxFiles}",
          maxFiles.toString(),
        );
        toast.error(error);
        onError?.(error);
        return;
      }

      const validFiles: FileWithPreview[] = [];
      const errors: string[] = [];

      fileArray.forEach((file) => {
        const validation = validateFile(file);
        if (validation.valid) {
          // Create preview for images
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
        onError?.(errors.join(", "));
      }

      if (validFiles.length > 0) {
        setFiles((prev) => [...prev, ...validFiles]);
        onUploadComplete?.(validFiles);
      }
    },
    [files.length, maxFiles, validateFile, onUploadComplete, onError],
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      const removed = newFiles.splice(index, 1)[0];
      // Revoke preview URL to avoid memory leaks
      if (removed.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return newFiles;
    });
  }, []);

  const clearFiles = useCallback(() => {
    // Revoke all preview URLs
    files.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
  }, [files]);

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }, []);

  const getFileIcon = useCallback((file: File): string => {
    const type = file.type;
    const name = file.name.toLowerCase();

    if (type.startsWith("image/")) return "🖼️";
    if (type === "application/pdf") return "📄";
    if (
      type === "application/msword" ||
      type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
      return "📝";
    if (
      type === "application/vnd.ms-excel" ||
      type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      type === "text/csv" ||
      type === "application/csv" ||
      name.endsWith(".csv")
    )
      return "📊";
    if (
      type === "application/vnd.ms-powerpoint" ||
      type ===
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    )
      return "📽️";
    if (type === "application/json" || name.endsWith(".json")) return "📋";
    if (
      type === "application/xml" ||
      type === "text/xml" ||
      name.endsWith(".xml")
    )
      return "📰";
    if (type.startsWith("text/")) return "📃";
    return "📎";
  }, []);

  return {
    files,
    uploading,
    progress,
    addFiles,
    removeFile,
    clearFiles,
    validateFile,
    formatFileSize,
    getFileIcon,
    setUploading,
    setProgress,
  };
}
