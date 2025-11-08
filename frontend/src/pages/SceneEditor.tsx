import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Trash2, ArrowRight, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
import { Label } from "@/components/ui/label";

interface Segment {
  id: string;
  text: string;
}

export default function SceneEditor() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [generating, setGenerating] = useState(false);
  const [segments, setSegments] = useState<Segment[]>([
    { id: "1", text: "Welcome to this training video on door replacement procedures." },
    { id: "2", text: "First, ensure the equipment is powered off and cooled down completely." },
    { id: "3", text: "Remove the old door by unscrewing the hinges carefully." },
  ]);

  const handleSegmentChange = (segmentId: string, text: string) => {
    setSegments((prev) =>
      prev.map((seg) => (seg.id === segmentId ? { ...seg, text } : seg))
    );
  };

  const handleSaveSegment = (segmentId: string) => {
    toast({
      title: "Saved",
      description: "Segment updated successfully",
    });
  };

  const handleDeleteSegment = (segmentId: string) => {
    setSegments((prev) => prev.filter((seg) => seg.id !== segmentId));
    toast({
      title: "Success",
      description: "Segment deleted",
    });
  };

  const handleGenerateVideo = () => {
    setGenerating(true);
    toast({
      title: "Generating video",
      description: "Your video is being created. This may take a few minutes...",
    });

    // Navigate to library after a delay
    setTimeout(() => {
      navigate("/library");
    }, 1500);
  };

  return (
    <>
      <div className="container mx-auto p-8 max-w-7xl">
        {/* Scene Segments */}
        <div className="space-y-6 mb-6 pb-24">
          {segments.map((segment, index) => (
            <Card key={segment.id}>
              <CardContent className="p-6">
                {/* Header: Segment title and menu */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Segment {index + 1}</h3>
                  <AlertDialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Segment
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Segment {index + 1}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove the segment from your scene. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteSegment(segment.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                {/* Content: Voiceover Text */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor={`voiceover-${segment.id}`} className="mb-2 block">
                      Voiceover
                    </Label>
                    <Textarea
                      id={`voiceover-${segment.id}`}
                      value={segment.text}
                      onChange={(e) => handleSegmentChange(segment.id, e.target.value)}
                      onBlur={() => handleSaveSegment(segment.id)}
                      placeholder="Enter voiceover script..."
                      className="min-h-[150px] resize-none"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {segments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No scene segments available</p>
          </div>
        )}
      </div>

      {/* Sticky Bottom Navigation */}
      <div className="sticky bottom-0 left-0 right-0 mt-auto border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl px-8 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={handleGenerateVideo}
              disabled={generating || segments.length === 0}
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Generate Video
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
