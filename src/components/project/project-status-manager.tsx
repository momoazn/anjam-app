import { useState } from "react";
import { GripVertical } from "lucide-react";
import { toast } from "sonner";
import { useProjectStatusConfigs, type StatusConfigsResponse } from "@/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { pb } from "@/lib/pocketbase";
import { cn } from "@/lib/utils";

interface ProjectStatusManagerProps {
  projectId: string;
}

export function ProjectStatusManager({ projectId }: ProjectStatusManagerProps) {
  const [togglingStatusId, setTogglingStatusId] = useState<string | null>(null);
  const {
    data: statusConfigs,
    isLoading,
    refetch,
  } = useProjectStatusConfigs(projectId);

  const handleToggleStatus = async (status: StatusConfigsResponse) => {
    setTogglingStatusId(status.id);

    try {
      const response = await pb.send(
        `/api/tm/status-configs/${status.id}/toggle`,
        {
          method: "PATCH",
        },
      );

      if (response.enabled !== undefined) {
        toast.success(
          response.enabled
            ? `وضعیت "${status.name}" فعال شد`
            : `وضعیت "${status.name}" غیرفعال شد`,
        );
        refetch();
      }
    } catch (error) {
      const errorMessage =
        (typeof error === "object" &&
        error !== null &&
        "data" in error &&
        typeof (error as { data?: { error?: string } }).data?.error === "string"
          ? (error as { data?: { error?: string } }).data?.error
          : undefined) ||
        (error instanceof Error ? error.message : undefined) ||
        "خطا در تغییر وضعیت";

      toast.error(errorMessage);
    } finally {
      setTogglingStatusId(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>مدیریت وضعیت‌های پروژه</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  // Sort by order
  const sortedStatuses = [...(statusConfigs || [])].sort(
    (a, b) => a.order - b.order,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>مدیریت وضعیت‌های پروژه</CardTitle>
        <p className="text-muted-foreground text-sm">
          می‌توانید وضعیت‌های مورد نیاز برای پروژه را فعال یا غیرفعال کنید. تنها
          وضعیت‌هایی که تسکی در آن‌ها نباشد می‌توانند غیرفعال شوند.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {sortedStatuses.map((status) => {
          const isToggling = togglingStatusId === status.id;
          const isDefault = [
            "todo",
            "in_progress",
            "pending",
            "done",
            "canceled",
          ].includes(status.key);

          return (
            <Card
              key={status.id}
              className={cn(
                "transition-all",
                status.enabled
                  ? "border-primary/20 bg-card"
                  : "border-muted bg-muted/30 opacity-60",
              )}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <GripVertical className="text-muted-foreground h-5 w-5" />
                  <div>
                    <p
                      className={cn(
                        "font-medium",
                        !status.enabled && "text-muted-foreground",
                      )}
                    >
                      {status.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-muted-foreground text-xs">
                        {status.key}
                      </p>
                      {isDefault && (
                        <span className="bg-primary/10 text-primary rounded px-1.5 py-0.5 text-xs">
                          پیش‌فرض
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {status.enabled ? (
                    <span className="text-muted-foreground text-sm">فعال</span>
                  ) : (
                    <span className="text-muted-foreground text-sm">
                      غیرفعال
                    </span>
                  )}
                  <Switch
                    checked={status.enabled || false}
                    onCheckedChange={() => handleToggleStatus(status)}
                    disabled={isToggling}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </CardContent>
    </Card>
  );
}
