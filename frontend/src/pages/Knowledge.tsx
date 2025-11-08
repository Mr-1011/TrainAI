import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Package } from "lucide-react";
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

interface Equipment {
  id: string;
  name: string;
  manufacturer: string;
  category: string;
  description?: string;
  itemCount: number;
  createdAt: string;
}

export default function Knowledge() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newEquipmentName, setNewEquipmentName] = useState("");
  const [newEquipmentManufacturer, setNewEquipmentManufacturer] = useState("");
  const [newEquipmentCategory, setNewEquipmentCategory] = useState("");
  const { toast } = useToast();

  // Mock data for demonstration
  const equipment: Equipment[] = [
    {
      id: "1",
      name: "SelfCookingCenter 101",
      manufacturer: "Rational",
      category: "Oven",
      description: "Commercial cooking oven with multiple functions",
      itemCount: 5,
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      name: "SelfCookingCenter 102",
      manufacturer: "Rational",
      category: "Oven",
      description: "Advanced commercial cooking oven",
      itemCount: 3,
      createdAt: "2024-01-20",
    },
    {
      id: "3",
      name: "VarioCookingCenter 101",
      manufacturer: "Rational",
      category: "Multi-Cooker",
      description: "Versatile cooking equipment",
      itemCount: 2,
      createdAt: "2024-01-22",
    },
  ];

  const handleCreateEquipment = () => {
    if (!newEquipmentName.trim() || !newEquipmentManufacturer.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Equipment Created",
      description: `${newEquipmentName} has been added to your equipment list.`,
    });

    setIsCreateDialogOpen(false);
    setNewEquipmentName("");
    setNewEquipmentManufacturer("");
    setNewEquipmentCategory("");
  };

  const handleEquipmentClick = (equipmentId: string) => {
    navigate(`/knowledge/${equipmentId}`);
  };

  const filteredEquipment = equipment.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEquipment.map((item) => (
          <Card
            key={item.id}
            className="cursor-pointer transition-shadow hover:shadow-lg"
            onClick={() => handleEquipmentClick(item.id)}
          >
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">{item.name}</CardTitle>
                  <CardDescription className="truncate">
                    {item.manufacturer} • {item.category}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {item.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {item.description}
                </p>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.itemCount} {item.itemCount === 1 ? 'item' : 'items'}
                </span>
                <span className="text-muted-foreground">
                  Added {item.createdAt}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredEquipment.length === 0 && (
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
              Create a new equipment entry to organize your documentation
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer *</Label>
              <Input
                id="manufacturer"
                placeholder="e.g., Rational"
                value={newEquipmentManufacturer}
                onChange={(e) => setNewEquipmentManufacturer(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="e.g., Oven, Multi-Cooker"
                value={newEquipmentCategory}
                onChange={(e) => setNewEquipmentCategory(e.target.value)}
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
            <Button onClick={handleCreateEquipment}>
              Create Equipment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
