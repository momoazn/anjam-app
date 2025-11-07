import { useState } from "react";
import { Plus, Trash2, GripVertical, Save, X } from "lucide-react";
import { toast } from "sonner";
import {
  useProjectStatusConfigs,
  useCreateStatusConfig,
  useUpdateStatusConfig,
  useDeleteStatusConfig,
  type StatusConfigsResponse,
} from "@/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectStatusManagerProps {
  projectId: string;
}

export function ProjectStatusManager({ projectId }: ProjectStatusManagerProps) {
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    color: "",
    icon: "",
  });
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    key: "",
    color: "gray",
    icon: "IconCircle",
  });
  const [statusToDelete, setStatusToDelete] = useState<StatusConfigsResponse | null>(
    null,
  );

  const { data: statusConfigs, isLoading } = useProjectStatusConfigs(projectId);
  const createMutation = useCreateStatusConfig();
  const updateMutation = useUpdateStatusConfig();
  const deleteMutation = useDeleteStatusConfig();

  const handleStartEdit = (status: StatusConfigsResponse) => {
    setEditingStatus(status.id);
    setEditForm({
      name: status.name,
      color: status.color || "",
      icon: status.icon || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingStatus(null);
    setEditForm({ name: "", color: "", icon: "" });
  };

  const handleSaveEdit = async () => {
    if (!editingStatus) return;

    updateMutation.mutate(
      {
        id: editingStatus,
        data: editForm,
      },
      {
        onSuccess: () => {
          toast.success("وضعیت با موفقیت به‌روزرسانی شد");
          handleCancelEdit();
        },
        onError: (error) => {
          toast.error(`خطا در به‌روزرسانی وضعیت: ${error.message}`);
        },
      },
    );
  };

  const handleCreateStatus = async () => {
    if (!createForm.name || !createForm.key) {
      toast.error("لطفاً نام و کلید وضعیت را وارد کنید");
      return;
    }

    const maxOrder = Math.max(...(statusConfigs?.map((s) => s.order) || [0]), 0);

    createMutation.mutate(
      {
        project: projectId,
        name: createForm.name,
        key: createForm.key.toLowerCase().replace(/\s+/g, "_"),
        color: createForm.color,
        icon: createForm.icon,
        order: maxOrder + 1,
        is_completed: false,
        is_canceled: false,
      },
      {
        onSuccess: () => {
          toast.success("وضعیت جدید با موفقیت ایجاد شد");
          setIsCreating(false);
          setCreateForm({ name: "", key: "", color: "gray", icon: "IconCircle" });
        },
        onError: (error) => {
          toast.error(`خطا در ایجاد وضعیت: ${error.message}`);
        },
      },
    );
  };

  const handleDeleteStatus = async () => {
    if (!statusToDelete) return;

    deleteMutation.mutate(
      {
        id: statusToDelete.id,
        projectId: projectId,
      },
      {
        onSuccess: () => {
          toast.success("وضعیت با موفقیت حذف شد");
          setStatusToDelete(null);
        },
        onError: (error) => {
          toast.error(`خطا در حذف وضعیت: ${error.message}`);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>مدیریت وضعیت‌های پروژه</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>مدیریت وضعیت‌های پروژه</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsCreating(true)}
            disabled={isCreating}
          >
            <Plus className="ml-2 h-4 w-4" />
            افزودن وضعیت جدید
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Create new status form */}
          {isCreating && (
            <Card className="border-2 border-dashed">
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="new-name">نام وضعیت</Label>
                    <Input
                      id="new-name"
                      value={createForm.name}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, name: e.target.value })
                      }
                      placeholder="مثلاً: در حال بررسی"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-key">کلید (انگلیسی)</Label>
                    <Input
                      id="new-key"
                      value={createForm.key}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, key: e.target.value })
                      }
                      placeholder="e.g: in_review"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsCreating(false);
                      setCreateForm({
                        name: "",
                        key: "",
                        color: "gray",
                        icon: "IconCircle",
                      });
                    }}
                  >
                    <X className="ml-2 h-4 w-4" />
                    لغو
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCreateStatus}
                    disabled={createMutation.isPending}
                  >
                    <Save className="ml-2 h-4 w-4" />
                    ذخیره
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Existing statuses */}
          {statusConfigs?.map((status) => (
            <Card key={status.id} className="group">
              <CardContent className="flex items-center justify-between p-4">
                {editingStatus === status.id ? (
                  <div className="flex-1 space-y-2">
                    <Input
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      placeholder="نام وضعیت"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                      >
                        <X className="ml-2 h-4 w-4" />
                        لغو
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveEdit}
                        disabled={updateMutation.isPending}
                      >
                        <Save className="ml-2 h-4 w-4" />
                        ذخیره
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <GripVertical className="text-muted-foreground h-5 w-5 cursor-grab opacity-0 transition-opacity group-hover:opacity-100" />
                      <div>
                        <p className="font-medium">{status.name}</p>
                        <p className="text-muted-foreground text-sm">{status.key}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStartEdit(status)}
                      >
                        ویرایش
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setStatusToDelete(status)}
                        disabled={
                          status.key === "todo" ||
                          status.key === "in_progress" ||
                          status.key === "done" ||
                          status.key === "canceled"
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!statusToDelete}
        onOpenChange={() => setStatusToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف وضعیت</AlertDialogTitle>
            <AlertDialogDescription>
              آیا از حذف وضعیت "{statusToDelete?.name}" اطمینان دارید؟ این عمل
              قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>لغو</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStatus}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
