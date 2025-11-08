import { useRef } from "react";
import type { ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload, Loader2, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getEquipments, uploadEquipmentFile } from "@/services/equipment.service";
import type { Equipment, EquipmentFileType } from "@/types/equipment";
import { API_BASE_URL } from "@/lib/api-client";

export default function EquipmentDetail() {
  const { equipmentId } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const manualInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const {
    data: equipments = [],
    isLoading,
    isError,
    error,
  } = useQuery<Equipment[]>({
    queryKey: ["equipments"],
    queryFn: getEquipments,
  });

  const equipment = equipments.find((item) => item.id === equipmentId);

  const manualUploadMutation = useMutation({
    mutationFn: (file: File) => {
      if (!equipmentId) {
        return Promise.reject(new Error("Equipment not found"));
      }
      return uploadEquipmentFile({
        equipmentId,
        file,
        type: "manual",
      });
    },
    onSuccess: () => {
      toast({
        title: "Manual uploaded",
        description: "The manual is now available in your knowledge base.",
      });
      queryClient.invalidateQueries({ queryKey: ["equipments"] });
    },
    onError: (uploadError) => {
      const message =
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to upload manual.";
      toast({
        title: "Upload failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  const imageUploadMutation = useMutation({
    mutationFn: (file: File) => {
      if (!equipmentId) {
        return Promise.reject(new Error("Equipment not found"));
      }
      return uploadEquipmentFile({
        equipmentId,
        file,
        type: "image",
      });
    },
    onSuccess: () => {
      toast({
        title: "Image uploaded",
        description: "The image is now attached to this equipment.",
      });
      queryClient.invalidateQueries({ queryKey: ["equipments"] });
    },
    onError: (uploadError) => {
      const message =
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to upload image.";
      toast({
        title: "Upload failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  const buildAssetUrl = (path: string) => {
    if (path.startsWith("http")) return path;
    const trimmedBase = API_BASE_URL.replace(/\/$/, "");
    const trimmedPath = path.replace(/^\//, "");
    return `${trimmedBase}/${trimmedPath}`;
  };

  const getFileName = (path: string) => path.split("/").pop() ?? path;

  const triggerFilePicker = (type: EquipmentFileType) => {
    if (type === "manual") {
      manualInputRef.current?.click();
    } else {
      imageInputRef.current?.click();
    }
  };

  const handleFileChange = (
    type: EquipmentFileType,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!equipmentId) {
      toast({
        title: "Missing equipment",
        description: "Please return to knowledge list and try again.",
        variant: "destructive",
      });
      return;
    }

    if (type === "manual") {
      manualUploadMutation.mutate(file);
    } else {
      imageUploadMutation.mutate(file);
    }

    event.target.value = "";
  };

  if (!equipmentId) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Missing equipment</CardTitle>
            <CardDescription>
              We could not determine which equipment you wanted to view. Please
              return to the knowledge page and select an item again.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {isLoading && (
        <div className="p-6 border rounded-lg animate-pulse">
          Loading equipment...
        </div>
      )}

      {isError && (
        <div className="p-4 border border-destructive/40 bg-destructive/5 rounded-lg text-sm text-destructive">
          {error instanceof Error
            ? error.message
            : "Unable to load equipment right now."}
        </div>
      )}

      {equipment && (
        <>
          {/* Equipment Info */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div>
                <h1 className="text-3xl font-bold">{equipment.name}</h1>
                <p className="text-muted-foreground">
                  {equipment.manuals.length}{" "}
                  {equipment.manuals.length === 1 ? "manual" : "manuals"} •{" "}
                  {equipment.images.length}{" "}
                  {equipment.images.length === 1 ? "image" : "images"}
                </p>
              </div>
            </div>
          </div>

          {/* Hidden file inputs */}
          <input
            ref={manualInputRef}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf"
            className="hidden"
            onChange={(event) => handleFileChange("manual", event)}
          />
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => handleFileChange("image", event)}
          />

          {/* Upload Sections - Stacked Vertically */}
          <div className="space-y-6">
            {/* Manuals Section - List Layout */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Manuals</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground mt-1">
                      PDF documentation and user guides
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => triggerFilePicker("manual")}
                    disabled={manualUploadMutation.isPending}
                  >
                    {manualUploadMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Upload
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {equipment.manuals.length > 0 ? (
                  <div className="space-y-2">
                    {equipment.manuals.map((filePath) => (
                      <div
                        key={filePath}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {getFileName(filePath)}
                          </p>
                          <a
                            href={buildAssetUrl(filePath)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            Download
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      No manuals uploaded yet
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      className="mt-2"
                      onClick={() => triggerFilePicker("manual")}
                    >
                      Upload your first manual
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Images Section - Grid Layout */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Images</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground mt-1">
                      Reference images, diagrams, and photos
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => triggerFilePicker("image")}
                    disabled={imageUploadMutation.isPending}
                  >
                    {imageUploadMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Upload
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {equipment.images.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {equipment.images.map((filePath) => (
                      <Card
                        key={filePath}
                        className="overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <div className="aspect-video w-full overflow-hidden bg-muted">
                          <img
                            src={buildAssetUrl(filePath)}
                            alt={getFileName(filePath)}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate text-sm">
                                {getFileName(filePath)}
                              </p>
                              <a
                                href={buildAssetUrl(filePath)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline"
                              >
                                Open image
                              </a>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      No images uploaded yet
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      className="mt-2"
                      onClick={() => triggerFilePicker("image")}
                    >
                      Upload your first image
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 3D Models Section - Coming Soon */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle>3D Models</CardTitle>
                      <BadgeCheck className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <CardDescription className="text-sm text-muted-foreground mt-1">
                      OBJ, FBX, GLTF, GLB model files
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 border-2 border-dashed rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">
                    3D model uploads coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
