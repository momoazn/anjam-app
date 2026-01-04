import { Copy, RefreshCw, XCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ErrorToastProps = {
  error: Error | string;
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
};

export function ErrorToast({
  error,
  title = "خطا رخ داد",
  description,
  retryLabel = "تلاش مجدد",
  onRetry,
  className,
}: ErrorToastProps) {
  const [detailsCopied, setDetailsCopied] = useState(false);

  const errorMessage = typeof error === "string" ? error : error.message;
  const errorDetails = typeof error === "string" ? error : error.stack || "";

  const handleCopyDetails = async () => {
    await navigator.clipboard.writeText(errorDetails);
    setDetailsCopied(true);
    setTimeout(() => setDetailsCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "bg-destructive/10 border-destructive/20 text-destructive rounded-lg border p-4 max-w-md",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="grid gap-1 flex-1">
          <div className="font-bold text-sm">{title}</div>
          <div className="text-xs text-muted-foreground">
            {description || "عملیات با مشکل مواجه شد. لطفا دوباره تلاش کنید."}
          </div>

          {/* Show error details in development */}
          {import.meta.env.DEV && errorDetails && (
            <div className="mt-2 rounded bg-destructive/20 p-2 font-mono text-[10px] overflow-hidden">
              <p className="truncate">{errorMessage}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-3 flex items-center gap-2">
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="h-7 gap-1.5 text-xs border-destructive/30 hover:bg-destructive/20"
              >
                <RefreshCw className="h-3 w-3" />
                {retryLabel}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyDetails}
              className="h-7 gap-1.5 text-xs"
            >
              <Copy className="h-3 w-3" />
              {detailsCopied ? "کپی شد" : "جزئیات"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
