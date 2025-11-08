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

  // Mock data - Advanced 4D videos
  const videos: Video[] = [
    {
      id: "1",
      title: "Advanced Door Replacement - 4D Interactive",
      model: "Rational SCC 101",
      taskType: "Door Replacement",
      status: "completed",
    },
    {
      id: "2",
      title: "Immersive Maintenance Tutorial - 360°",
      model: "Rational SCC 102",
      taskType: "Maintenance",
      status: "processing",
    },
  ];

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

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterModel} onValueChange={setFilterModel}>
          <SelectTrigger className="w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Models</SelectItem>
            <SelectItem value="scc101">SCC 101</SelectItem>
            <SelectItem value="scc102">SCC 102</SelectItem>
            <SelectItem value="scc201">SCC 201</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {/* Thumbnail with 4D Badge */}
            <div className="relative aspect-video bg-muted cursor-pointer" onClick={handlePlay}>
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors">
                <Play className="h-12 w-12 text-white" />
              </div>
              <Badge className="absolute top-2 left-2 bg-primary">
                <Film className="h-3 w-3 mr-1" />
                4D
              </Badge>
              {getStatusBadge(video.status) && (
                <div className="absolute top-2 right-2">
                  {getStatusBadge(video.status)}
                </div>
              )}
            </div>

            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <CardTitle className="text-base line-clamp-1">
                    {video.title}
                  </CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDownload(video.title)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AlertDialog>
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="text-destructive focus:text-destructive"
                      >
                        <AlertDialogTrigger className="flex items-center w-full">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </AlertDialogTrigger>
                      </DropdownMenuItem>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Video</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{video.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {videos.length === 0 && (
        <div className="text-center py-12">
          <Film className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No 4D videos yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first advanced 4D training video
          </p>
          <Button>Create 4D Video</Button>
        </div>
      )}
    </div>
  );
}
