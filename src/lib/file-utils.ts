import { projects } from "@/constants";

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

export function getFileIcon(file: File): string {
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
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

function isAllowedType(fileType: string, allowedTypes: string[]): boolean {
  return allowedTypes.some((allowedType) => {
    if (allowedType.endsWith("/*")) {
      const baseType = allowedType.split("/")[0];
      return fileType.startsWith(baseType + "/");
    }
    return fileType === allowedType;
  });
}

export function addPreviewIfNeeded(file: File): FileWithPreview {
  const fileWithPreview = file as FileWithPreview;
  if (file.type.startsWith("image/")) {
    fileWithPreview.preview = URL.createObjectURL(file);
  }
  return fileWithPreview;
}

function validateFileSize(
  file: File,
  maxSize: number,
): { valid: boolean; error?: string } {
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: projects.files.validation.tooLarge.replace(
        "{max}",
        `${maxSizeMB}MB`,
      ),
    };
  }
  return { valid: true };
}

function validateFileType(
  file: File,
  allowedTypes: string[],
): { valid: boolean; error?: string } {
  const fileType = file.type;
  const isAllowed = isAllowedType(fileType, allowedTypes);

  if (!isAllowed) {
    return {
      valid: false,
      error: projects.files.validation.invalidType.replace(
        "{fileName}",
        file.name,
      ),
    };
  }

  return { valid: true };
}

export function validateFile(
  file: File,
  maxSize: number,
  allowedTypes: string[],
): { valid: boolean; error?: string } {
  const sizeValidation = validateFileSize(file, maxSize);
  if (!sizeValidation.valid) return sizeValidation;

  return validateFileType(file, allowedTypes);
}

export { DEFAULT_MAX_SIZE, DEFAULT_ALLOWED_TYPES };
