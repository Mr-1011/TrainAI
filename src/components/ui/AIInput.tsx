import { useEffect, useRef, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Wrench,
  Package,
  AlertCircle,
  ArrowUpIcon,
  X,
  Settings,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface UseAutoResizeTextareaProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      textarea.style.height = `${minHeight}px`;

      const newHeight = Math.max(
        minHeight,
        Math.min(
          textarea.scrollHeight,
          maxHeight ?? Number.POSITIVE_INFINITY
        )
      );

      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${minHeight}px`;
    }
  }, [minHeight]);

  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

export function AIInput() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [value, setValue] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isModelDialogOpen, setIsModelDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("");
  const [savedModel, setSavedModel] = useState<{ id: string; name: string } | null>(null);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200,
  });

  const equipmentModels = [
    { id: "scc101", name: "Rational SelfCookingCenter 101" },
    { id: "scc102", name: "Rational SelfCookingCenter 102" },
    { id: "scc201", name: "Rational SelfCookingCenter 201" },
    { id: "vcc101", name: "Rational VarioCookingCenter 101" },
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        handleSubmit();
      }
    }
  };

  const handleSubmit = async () => {
    if (!value.trim()) {
      toast({
        title: "Error",
        description: "Please describe the maintenance task",
        variant: "destructive",
      });
      return;
    }

    if (!savedModel) {
      toast({
        title: "Error",
        description: "Please select an equipment model",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);

      // Simulate video generation - show success and navigate to library
      toast({
        title: "Video Generation Started",
        description: `Creating training video for ${savedModel.name}. This will take 3-5 minutes.`,
      });

      // Navigate to library after a short delay
      setTimeout(() => {
        navigate("/library");
      }, 1500);
    } catch (error) {
      console.error("Failed to create video:", error);
      toast({
        title: "Error",
        description: "Failed to create video. Please try again.",
        variant: "destructive",
      });
      setIsCreating(false);
    }
  };

  const handleSaveModel = () => {
    if (selectedModel) {
      const model = equipmentModels.find((m) => m.id === selectedModel);
      if (model) {
        setSavedModel(model);
        setIsModelDialogOpen(false);
      }
    }
  };

  const handleRemoveModel = () => {
    setSavedModel(null);
  };

  const handleQuickPrompt = (prompt: string) => {
    setValue(prompt);
    adjustHeight();
    textareaRef.current?.focus();
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 space-y-8">
      <h1 className="text-4xl font-bold text-foreground">
        What training video can I help you create?
      </h1>

      <div className="w-full">
        <div className="relative bg-background rounded-xl border border-border shadow-sm">
          <div className="overflow-y-auto">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                adjustHeight();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Describe the maintenance task... (e.g., 'change the door because it's broken')"
              className={cn(
                "w-full px-4 py-3",
                "resize-none",
                "bg-transparent",
                "border-none",
                "text-foreground text-sm",
                "focus:outline-none",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                "placeholder:text-muted-foreground placeholder:text-sm",
                "min-h-[90px]"
              )}
              style={{
                overflow: "hidden",
              }}
            />
          </div>

          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-2">
              {savedModel ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs border border-primary/20">
                  <Package className="w-3.5 h-3.5" />
                  <span>{savedModel.name}</span>
                  <button
                    onClick={handleRemoveModel}
                    className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsModelDialogOpen(true)}
                  className="group px-3 py-1.5 hover:bg-primary rounded-lg transition-colors flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary-foreground border border-dashed border-border hover:border-primary"
                >
                  <Package className="w-4 h-4 group-hover:text-primary-foreground" />
                  <span>Select Equipment</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isCreating || !value.trim() || !savedModel}
                className={cn(
                  "group px-1.5 py-1.5 rounded-lg text-sm transition-colors border border-border flex items-center justify-between gap-1",
                  value.trim() && savedModel && !isCreating
                    ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                    : "text-muted-foreground opacity-50 cursor-not-allowed"
                )}
              >
                <ArrowUpIcon
                  className={cn(
                    "w-4 h-4",
                    value.trim() && savedModel && !isCreating
                      ? "text-primary-foreground"
                      : "text-muted-foreground"
                  )}
                />
                <span className="sr-only">Generate</span>
              </button>
            </div>
          </div>
        </div>

        <Dialog open={isModelDialogOpen} onOpenChange={setIsModelDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Equipment Model</DialogTitle>
              <DialogDescription>
                Choose the equipment model for your training video
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="model">Equipment Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a model..." />
                  </SelectTrigger>
                  <SelectContent>
                    {equipmentModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsModelDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveModel} disabled={!selectedModel}>
                Select Model
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex items-center justify-center gap-3 mt-4">
          <ActionButton
            icon={<Wrench className="w-4 h-4" />}
            label="Door Replacement"
            onClick={() => handleQuickPrompt("Replace the broken door on the oven")}
          />
          <ActionButton
            icon={<Settings className="w-4 h-4" />}
            label="Routine Maintenance"
            onClick={() => handleQuickPrompt("Perform routine maintenance check on all components")}
          />
          <ActionButton
            icon={<AlertCircle className="w-4 h-4" />}
            label="Cleaning Procedure"
            onClick={() => handleQuickPrompt("Clean the heating elements and interior")}
          />
        </div>
      </div>
    </div>
  );
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

function ActionButton({ icon, label, onClick }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-2 px-4 py-2 bg-background hover:bg-primary rounded-full border border-border text-muted-foreground hover:text-primary-foreground transition-colors"
    >
      <span className="group-hover:text-primary-foreground">{icon}</span>
      <span className="text-xs">{label}</span>
    </button>
  );
}
