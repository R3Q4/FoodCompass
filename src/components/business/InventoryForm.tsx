import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useInventory } from "@/hooks/useInventory";
import { Plus } from "lucide-react";

const categories = [
  "Dairy",
  "Bakery",
  "Produce",
  "Meat & Seafood",
  "Frozen",
  "Beverages",
  "Snacks",
  "Prepared Foods",
  "Other"
];

const units = ["kg", "lbs", "units", "liters", "packs", "boxes", "cases"];

const InventoryForm = () => {
  const { user } = useAuth();
  const { addInventoryItem } = useInventory();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: 'units',
    originalPrice: '',
    expiryDate: '',
    location: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    const item = addInventoryItem({
      businessId: user.id,
      businessName: user.businessName || 'Unknown Business',
      name: formData.name,
      category: formData.category,
      quantity: parseInt(formData.quantity),
      unit: formData.unit,
      originalPrice: parseFloat(formData.originalPrice),
      expiryDate: formData.expiryDate,
      location: formData.location
    });

    toast({
      title: "Item added successfully!",
      description: `${formData.name} has been added with AI recommendations.`
    });

    // Reset form
    setFormData({
      name: '',
      category: '',
      quantity: '',
      unit: 'units',
      originalPrice: '',
      expiryDate: '',
      location: ''
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Surplus Inventory
        </CardTitle>
        <CardDescription>
          Enter details about your surplus food items. Our AI will analyze and recommend the best strategy.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                placeholder="e.g., Organic Milk"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <div className="flex gap-2">
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  placeholder="100"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                  className="flex-1"
                />
                <Select
                  value={formData.unit}
                  onValueChange={(value) => setFormData({ ...formData, unit: value })}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Original Price (per unit)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="5.99"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  required
                  className="pl-7"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Downtown Store, Warehouse A"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full md:w-auto">
            Add Item & Get AI Recommendations
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default InventoryForm;
