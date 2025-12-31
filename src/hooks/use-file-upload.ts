import { useCallback, useState } from "react";
import { toast } from "sonner";

import { projects } from "@/constants";
import {
  DEFAULT_ALLOWED_TYPES,
  DEFAULT_MAX_SIZE,
  type FileWithPreview,
  addPreviewIfNeeded,
  formatFileSize,
  getFileIcon,
  validateFile,
} from "@/lib/file-utils";

export type FileUploadOptions = {
  maxSize?: number;
  allowedTypes?: string[];
  maxFiles?: number;
  onUploadComplete?: (files: File[]) => void;
  onError?: (error: string) => void;
};

export { type FileWithPreview, getFileIcon, formatFileSize };

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

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles);

      if (maxFiles && files.length + fileArray.length > maxFiles) {
        const error = projects.files.validation.maxFiles.replace(
          "{maxFiles}",
          maxFiles.toString(),
        );
        toast.error(error);
        onError?.(error);
        return;
      }

      const validFiles: FileWithPreview[] = [];
      const errors: string[] = [];

      for (const file of fileArray) {
        const validation = validateFile(file, maxSize, allowedTypes);
        if (validation.valid) {
          validFiles.push(addPreviewIfNeeded(file));
        } else {
          errors.push(`${file.name}: ${validation.error}`);
        }
      }

      if (errors.length > 0) {
        for (const error of errors) {
          toast.error(error);
        }
        onError?.(errors.join(", "));
      }

      if (validFiles.length > 0) {
        setFiles((prev) => [...prev, ...validFiles]);
        onUploadComplete?.(validFiles);
      }
    },
    [files.length, maxFiles, maxSize, allowedTypes, onUploadComplete, onError],
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      const removed = newFiles.splice(index, 1)[0];
      if (removed.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return newFiles;
    });
  }, []);

  const clearFiles = useCallback(() => {
    for (const file of files) {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    }
    setFiles([]);
  }, [files]);

  return {
    files,
    uploading,
    progress,
    addFiles,
    removeFile,
    clearFiles,
    formatFileSize,
    getFileIcon,
    validateFile: (file: File) => validateFile(file, maxSize, allowedTypes),
    setUploading,
    setProgress,
  };
}
