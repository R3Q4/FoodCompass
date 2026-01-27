import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useInventory } from "@/hooks/useInventory";
import { Plus, Brain } from "lucide-react";

const categories = [
  "Dairy","Bakery","Produce","Meat & Seafood","Frozen","Beverages",
  "Snacks","Prepared Foods","Other"
];

const units = ["kg","lbs","units","liters","packs","boxes","cases"];

const InventoryForm = () => {
  const { user } = useAuth();
  const { addInventoryItem } = useInventory();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "", category: "", quantity: "", unit: "units",
    originalPrice: "", expiryDate: "", location: ""
  });

  const [businessContext, setBusinessContext] = useState({
    description: "", companyPdf: null as File | null, transactionPdf: null as File | null
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const inventoryItem = addInventoryItem({
      businessId: user.id,
      businessName: user.businessName || "Unknown Business",
      name: formData.name,
      category: formData.category,
      quantity: parseInt(formData.quantity),
      unit: formData.unit,
      originalPrice: parseFloat(formData.originalPrice),
      expiryDate: formData.expiryDate,
      location: formData.location
    });

    // FormData to send to API
    const aiPayload = new FormData();
    aiPayload.append("inventory", JSON.stringify(inventoryItem));
    aiPayload.append("description", businessContext.description);

    if (businessContext.companyPdf) {
      aiPayload.append("companyPdf", businessContext.companyPdf);
    }
    if (businessContext.transactionPdf) {
      aiPayload.append("transactionPdf", businessContext.transactionPdf);
    }

    try {
      const res = await fetch("/api/ai/recommendations", {
        method: "POST",
        body: aiPayload
      });

      const data = await res.json();

      toast({
        title: "AI recommendations generated",
        description: JSON.stringify(data.recommendations)
      });

    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to generate AI recommendations."
      });
    }

    setLoading(false);

    // Reset form
    setFormData({
      name: "", category: "", quantity: "", unit: "units",
      originalPrice: "", expiryDate: "", location: ""
    });
    setBusinessContext({ description: "", companyPdf: null, transactionPdf: null });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" /> Add Surplus Inventory
        </CardTitle>
        <CardDescription>
          Required inventory details + optional business context for smarter AI recommendations.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Item Name */}
            <div className="space-y-2">
              <Label>Item Name</Label>
              <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {/* Quantity + Unit */}
            <div className="space-y-2">
              <Label>Quantity</Label>
              <div className="flex gap-2">
                <Input type="number" min="1" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} required />
                <Select value={formData.unit} onValueChange={v => setFormData({ ...formData, unit: v })}>
                  <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                  <SelectContent>{units.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            {/* Original Price */}
            <div className="space-y-2">
              <Label>Original Price per unit</Label>
              <Input type="number" step="0.01" value={formData.originalPrice} onChange={e => setFormData({ ...formData, originalPrice: e.target.value })} required />
            </div>
            {/* Expiry Date */}
            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <Input type="date" value={formData.expiryDate} onChange={e => setFormData({ ...formData, expiryDate: e.target.value })} required />
            </div>
            {/* Location */}
            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} required />
            </div>
          </div>

          {/* Optional Business Context */}
          <Card className="bg-muted/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Brain className="h-4 w-4" /> Additional Business Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Description */}
              <div className="space-y-2">
                <Label>Company Description</Label>
                <CardDescription>Short info about your business</CardDescription>
                <Input placeholder="Business description" value={businessContext.description} onChange={e => setBusinessContext({ ...businessContext, description: e.target.value })} />
              </div>
              {/* PDFs */}
              <div className="space-y-2">
                <Label>Past Sales Transaction PDF</Label>
                <Input type="file" accept="application/pdf" onChange={e => setBusinessContext({ ...businessContext, companyPdf: e.target.files?.[0] || null })} />
              </div>
              <div className="space-y-2">
                <Label>Other Information PDF</Label>
                <Input type="file" accept="application/pdf" onChange={e => setBusinessContext({ ...businessContext, transactionPdf: e.target.files?.[0] || null })} />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" disabled={loading}>{loading ? "Generating..." : "Generate AI Recommendations"}</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default InventoryForm;
