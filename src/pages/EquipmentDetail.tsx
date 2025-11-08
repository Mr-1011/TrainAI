import { useState } from "react";
import { useParams } from "react-router-dom";
import { Upload, Box, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  url?: string;
}

export default function EquipmentDetail() {
  const { equipmentId } = useParams();
  const { toast } = useToast();

  // Mock data
  const equipment = {
    id: equipmentId,
    name: "SelfCookingCenter 101",
    manufacturer: "Rational",
    category: "Oven",
  };

  const [manuals, setManuals] = useState<UploadedFile[]>([
    {
      id: "1",
      name: "Installation Guide.pdf",
      size: "12.5 MB",
      uploadedAt: "2024-01-15",
    },
    {
      id: "2",
      name: "User Manual.pdf",
      size: "8.3 MB",
      uploadedAt: "2024-01-16",
    },
  ]);

  const [images, setImages] = useState<UploadedFile[]>([
    {
      id: "1",
      name: "icombi-pro-topshot.png",
      size: "2.3 MB",
      uploadedAt: "2024-01-17",
      url: "https://www.rational-online.com/media/images/food/icombi-topshots/topshots/icombi-pro-1011e-standard-unit-load-duck-breast-w500.png",
    },
    {
      id: "2",
      name: "icombi-pro-pullout.jpg",
      size: "1.8 MB",
      uploadedAt: "2024-01-18",
      url: "https://www.rational-online.com/media/images/product/icombipro/2023-ic/icombi-pro-1011e-standard-pulloutrails-891897-fix1280x720.jpg",
    },
  ]);

  const [models3D, setModels3D] = useState<UploadedFile[]>([
    {
      id: "1",
      name: "complete-unit.obj",
      size: "45.8 MB",
      uploadedAt: "2024-01-18",
    },
  ]);

  const handleFileUpload = (type: string) => {
    toast({
      title: "Upload Started",
      description: `${type} upload functionality will be implemented soon.`,
    });
  };

  const handleDelete = (type: string, id: string) => {
    toast({
      title: "File Deleted",
      description: "The file has been removed.",
    });

    if (type === "manual") {
      setManuals(manuals.filter((m) => m.id !== id));
    } else if (type === "image") {
      setImages(images.filter((i) => i.id !== id));
    } else if (type === "3d") {
      setModels3D(models3D.filter((m) => m.id !== id));
    }
  };


  return (
    <div className="space-y-6">
      {/* Equipment Info */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Box className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{equipment.name}</h1>
            <p className="text-muted-foreground">
              {equipment.manufacturer} • {equipment.category}
            </p>
          </div>
        </div>
      </div>

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
                onClick={() => handleFileUpload("Manual")}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {manuals.length > 0 ? (
              <div className="space-y-2">
                {manuals.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {file.size} • Uploaded {file.uploadedAt}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete("manual", file.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <p className="text-sm text-muted-foreground">No files uploaded yet</p>
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2"
                  onClick={() => handleFileUpload("Manual")}
                >
                  Upload your first file
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
                onClick={() => handleFileUpload("Image")}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {images.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((file) => (
                  <Card key={file.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {file.url && (
                      <div className="aspect-video w-full overflow-hidden">
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-sm">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {file.size} • {file.uploadedAt}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete("image", file.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <p className="text-sm text-muted-foreground">No images uploaded yet</p>
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2"
                  onClick={() => handleFileUpload("Image")}
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
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>
                <CardDescription className="text-sm text-muted-foreground mt-1">
                  OBJ, FBX, GLTF, GLB model files
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 border-2 border-dashed rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground">3D model uploads coming soon</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
