import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Play, Download, Trash2, Search, Filter, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { getVideos } from "@/services/video.service";
import type { Video, VideoStatus } from "@/types/video";

type StatusFilter = "all" | VideoStatus;

const statusOptions: { value: VideoStatus; label: string }[] = [
  { value: "success", label: "Success" },
  { value: "processing", label: "Processing" },
  { value: "failed", label: "Failed" },
];

const statusMeta: Record<VideoStatus, { variant: "default" | "secondary" | "destructive"; label: string }> = {
  success: { variant: "default", label: "Success" },
  processing: { variant: "secondary", label: "Processing" },
  failed: { variant: "destructive", label: "Failed" },
};

const getStatusBadge = (status: VideoStatus) => {
  const meta = statusMeta[status];
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
};

const formatDateLabel = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
};

export default function Library() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModel, setFilterModel] = useState("all");
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("all");
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const { toast } = useToast();

  const {
    data: videos = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["videos"],
    queryFn: getVideos,
  });

  const equipmentOptions = useMemo(() => {
    const ids = new Set<string>();
    videos.forEach((video) => {
      if (video.equipmentId) {
        ids.add(video.equipmentId);
      }
    });
    return Array.from(ids);
  }, [videos]);

  const filteredVideos = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return videos.filter((video) => {
      const matchesQuery = !query || video.prompt.toLowerCase().includes(query);
      const matchesStatus = filterStatus === "all" || video.status === filterStatus;
      const matchesEquipment = filterModel === "all" || video.equipmentId === filterModel;
      return matchesQuery && matchesStatus && matchesEquipment;
    });
  }, [videos, searchQuery, filterModel, filterStatus]);

  const handleDelete = (video: Video) => {
    toast({
      title: "Delete requested",
      description: `"${video.prompt}" would be deleted once this endpoint is implemented.`,
    });
  };

  const handleDownload = (video: Video) => {
    if (!video.resultUrl) {
      toast({
        title: "Download unavailable",
        description: "This video is still processing.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Download started",
      description: video.prompt,
    });
    window.open(video.resultUrl, "_blank", "noopener,noreferrer");
  };

  const handlePlay = (video: Video) => {
    if (!video.resultUrl) {
      toast({
        title: "Video not ready",
        description: "Please wait until processing finishes.",
        variant: "destructive",
      });
      return;
    }
    setActiveVideo(video);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row">
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
          <SelectTrigger className="w-full md:w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Equipment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Equipment</SelectItem>
            {equipmentOptions.map((id) => (
              <SelectItem key={id} value={id}>
                {id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filterStatus}
          onValueChange={(value) => setFilterStatus(value as StatusFilter)}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isError && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {error instanceof Error
            ? error.message
            : "Unable to load videos right now."}
        </div>
      )}

      {/* Video Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <Card key={item} className="animate-pulse h-64" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredVideos.map((video) => (
            <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Thumbnail */}
              <div
                className={`relative aspect-video bg-muted ${video.resultUrl ? "cursor-pointer" : "cursor-not-allowed opacity-60"
                  }`}
                onClick={() => video.resultUrl && handlePlay(video)}
              >
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors">
                  <Play className="h-12 w-12 text-white" />
                </div>
              </div>

              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <CardTitle className="text-base line-clamp-2">
                      {video.prompt}
                    </CardTitle>
                  </div>
                  <div className="flex items-start gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handlePlay(video)}>
                          <Play className="h-4 w-4 mr-2" />
                          Play
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(video)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <DropdownMenuItem
                            onSelect={(event) => event.preventDefault()}
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
                                Are you sure you want to delete &quot;{video.prompt}&quot;? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(video)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredVideos.length === 0 && (
        <div className="text-center py-12">
          <Play className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No videos match your filters</h3>
          <p className="text-muted-foreground mb-4">
            Adjust your search or create a new training video to see it here.
          </p>
          <Button>Create Video</Button>
        </div>
      )}
      <Dialog open={!!activeVideo} onOpenChange={(open) => !open && setActiveVideo(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{activeVideo?.prompt ?? "Video preview"}</DialogTitle>
          </DialogHeader>
          {activeVideo?.resultUrl ? (
            <video
              key={activeVideo.id}
              controls
              className="w-full rounded-lg"
              autoPlay
            >
              <source src={activeVideo.resultUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <p className="text-sm text-muted-foreground">
              This video is still processing.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
