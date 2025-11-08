import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Package } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createEquipment, getEquipments } from "@/services/equipment.service";
import type { Equipment } from "@/types/equipment";

export default function Knowledge() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newEquipmentName, setNewEquipmentName] = useState("");
  const { toast } = useToast();

  const {
    data: equipment = [],
    isLoading,
    isError,
    error,
  } = useQuery<Equipment[]>({
    queryKey: ["equipments"],
    queryFn: getEquipments,
  });

  const createEquipmentMutation = useMutation({
    mutationFn: (name: string) =>
      createEquipment({
        name,
      }),
    onSuccess: () => {
      toast({
        title: "Equipment created",
        description: `${newEquipmentName} is ready to use.`,
      });
      setIsCreateDialogOpen(false);
      setNewEquipmentName("");
      queryClient.invalidateQueries({ queryKey: ["equipments"] });
    },
    onError: (mutationError) => {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to create equipment. Please try again.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleCreateEquipment = () => {
    if (!newEquipmentName.trim()) {
      toast({
        title: "Error",
        description: "Equipment name is required",
        variant: "destructive",
      });
      return;
    }

    createEquipmentMutation.mutate(newEquipmentName.trim());
  };

  const handleEquipmentClick = (equipmentId: string) => {
    navigate(`/knowledge/${equipmentId}`);
  };

  const filteredEquipment = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) return equipment;
    return equipment.filter((item) =>
      item.name.toLowerCase().includes(query)
    );
  }, [equipment, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Search and Add Button */}
      <div className="flex gap-4 items-center justify-between">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search equipment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Equipment
        </Button>
      </div>

      {isError && (
        <div className="p-4 rounded-lg border border-destructive/40 bg-destructive/5 text-sm text-destructive">
          {error instanceof Error
            ? error.message
            : "Unable to load equipment right now."}
        </div>
      )}

      {/* Equipment Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((item) => (
            <Card key={item} className="h-32 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEquipment.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer transition-shadow hover:shadow-lg overflow-hidden"
              onClick={() => handleEquipmentClick(item.id)}
            >
              {/* Equipment Image Thumbnail */}
              <div className="relative aspect-video bg-muted">
                {item.images.length > 0 ? (
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">
                      {item.name}
                    </CardTitle>
                    <CardDescription className="truncate">
                      {item.manuals.length}{" "}
                      {item.manuals.length === 1 ? "manual" : "manuals"} •{" "}
                      {item.images.length}{" "}
                      {item.images.length === 1 ? "image" : "images"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredEquipment.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No equipment found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? "Try adjusting your search"
              : "Add your first equipment to get started"}
          </p>
          {!searchQuery && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Equipment
            </Button>
          )}
        </div>
      )}

      {/* Create Equipment Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Equipment</DialogTitle>
            <DialogDescription>
              Give your equipment a clear name so you can attach manuals and
              reference images.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Equipment Name *</Label>
              <Input
                id="name"
                placeholder="e.g., SelfCookingCenter 201"
                value={newEquipmentName}
                onChange={(e) => setNewEquipmentName(e.target.value)}
                disabled={createEquipmentMutation.isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateEquipment}
              disabled={createEquipmentMutation.isPending}
            >
              {createEquipmentMutation.isPending
                ? "Creating..."
                : "Create Equipment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
