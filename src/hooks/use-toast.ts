import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  action?: {
    label: string;
    onClick: () => void;
  };
};

export const useToast = () => {
  const toast = ({ title, description, variant, action }: ToastProps) => {
    const options = {
      description,
      action,
    };

    if (variant === "destructive") {
      sonnerToast.error(title || "", options);
    } else {
      sonnerToast.success(title || "", options);
    }
  };

  return { toast };
};
