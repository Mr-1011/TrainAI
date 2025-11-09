import { useState } from "react";
import { Play, Download, Trash2, Search, Filter, MoreVertical, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface Video {
  id: string;
  title: string;
  model: string;
  taskType: string;
  status: "completed" | "processing" | "failed";
}

export default function Studio() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModel, setFilterModel] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const { toast } = useToast();

  // No videos yet - coming soon
  const videos: Video[] = [];

  const handleDelete = () => {
    toast({
      title: "Video Deleted",
      description: "The advanced video has been removed from your studio.",
    });
  };

  const handleDownload = (title: string) => {
    toast({
      title: "Download Started",
      description: `Downloading: ${title}`,
    });
  };

  const handlePlay = () => {
    toast({
      title: "Opening Video",
      description: "Advanced 4D video player will be implemented soon.",
    });
  };

  const getStatusBadge = (status: Video["status"]) => {
    const variants: Record<Video["status"], { variant: "default" | "secondary" | "destructive"; label: string }> = {
      completed: { variant: "default", label: "Completed" },
      processing: { variant: "secondary", label: "Processing" },
      failed: { variant: "destructive", label: "Failed" },
    };
    const { variant, label } = variants[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Coming Soon State */}
      <div className="text-center py-16">
        <Film className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-2xl font-semibold mb-2">Advanced 4D Studio</h3>
        <p className="text-muted-foreground text-lg mb-2">
          Coming Soon
        </p>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          The next generation of immersive training videos with interactive 4D experiences is currently in development.
        </p>
      </div>
    </div>
  );
}
