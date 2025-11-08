import { useCallback } from "react";
import { toast as sonnerToast } from "sonner";

type ToastVariant = "default" | "destructive" | "success" | "info";

type ToastOptions = {
  title?: string;
  description?: string;
  duration?: number;
  variant?: ToastVariant;
};

const DEFAULT_DURATION = 4000;

function formatMessage({ title, description }: ToastOptions) {
  if (title) return title;
  if (description) return description;
  return "";
}

function showToast(options: ToastOptions) {
  const { variant = "default", duration = DEFAULT_DURATION } = options;
  const message = formatMessage(options);
  const hasTitleAndDescription = Boolean(options.title && options.description);
  const description = hasTitleAndDescription ? options.description : undefined;

  const common = { description, duration } as const;

  switch (variant) {
    case "destructive":
      return sonnerToast.error(message || "Something went wrong", common);
    case "success":
      return sonnerToast.success(message || "Success", common);
    case "info":
      return sonnerToast.info(message || "Notice", common);
    default:
      return sonnerToast(message, common);
  }
}

export function useToast() {
  const toast = useCallback((options: ToastOptions) => showToast(options), []);
  return {
    toast,
  };
}

export { showToast as toast };
