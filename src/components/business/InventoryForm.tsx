import { extractTextFromPdf } from "@/ai/helperPDF"; // adjust path

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
  "Dairy","Bakery","Produce","Meat & Seafood","Frozen",
  "Beverages","Snacks","Prepared Foods","Other"
];

const units = ["kg", "lbs", "units", "liters", "packs", "boxes", "cases"];

// Helper to get coordinates from location string using Nominatim
const getCoordinates = async (address: string) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
      {
        headers: {
          "User-Agent": "InventoryApp/1.0" // required by Nominatim
        }
      }
    );
    const data = await response.json();
    if (data.length === 0) return null;
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon)
    };
  } catch (err) {
    console.error("Error fetching coordinates:", err);
    return null;
  }
};

const InventoryForm = () => {
  const { user } = useAuth();
  const { addInventoryItem } = useInventory();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [aiResults, setAiResults] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: "",
    unit: "units",
    originalPrice: "",
    expiryDate: "",
    location: ""
  });

  const [businessContext, setBusinessContext] = useState({
    description: "",
    companyPdf: null as File | null
  });


const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!user) return;

  setLoading(true);

  // Get coordinates from location
  const coords = await getCoordinates(formData.location);

  const inventoryItem = addInventoryItem({
    businessId: user.id,
    businessName: user.businessName || "Unknown Business",
    name: formData.name,
    category: formData.category,
    quantity: parseInt(formData.quantity),
    unit: formData.unit,
    originalPrice: parseFloat(formData.originalPrice),
    expiryDate: formData.expiryDate,
    location: formData.location,
    coordinates: coords // store coordinates
  });

  // Extract text from PDF (if uploaded)
  let companyPdfText = "";
  if (businessContext.companyPdf) {
    try {
      companyPdfText = await extractTextFromPdf(businessContext.companyPdf);
    } catch (err) {
      console.error("Error reading PDF text:", err);
      toast({
        title: "PDF Error",
        description: "Failed to read the PDF text."
      });
    }
  }

  // Prepare AI payload
  const aiPayload = new FormData();
  aiPayload.append("inventory", JSON.stringify(inventoryItem));
  aiPayload.append("description", businessContext.description);
  aiPayload.append("companyPdfText", companyPdfText); // send text instead of file

  try {
    const res = await fetch("/api/ai/recommendations", {
      method: "POST",
      body: aiPayload
    });
    const data = await res.json();
    setAiResults(data.recommendations);

    toast({
      title: "AI recommendations generated",
      description: "We analyzed your inventory with additional context."
    });
  } catch (err: any) {
    toast({
      title: "Error",
      description: err.message || "Failed to generate AI recommendations."
    });
  }

  setLoading(false);

  // Reset form
  setFormData({
    name: "",
    category: "",
    quantity: "",
    unit: "units",
    originalPrice: "",
    expiryDate: "",
    location: ""
  });

  setBusinessContext({
    description: "",
    companyPdf: null,
  });
};


  return (
    <>
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
            {/* INVENTORY INPUTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Item Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
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
                <Label>Quantity</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    required
                  />
                  <Select
                    value={formData.unit}
                    onValueChange={(value) =>
                      setFormData({ ...formData, unit: value })
                    }
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((u) => (
                        <SelectItem key={u} value={u}>{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Original Price per unit</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.originalPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, originalPrice: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Expiry Date</Label>
                <Input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expiryDate: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="City, Address, or Postal Code"
                  required
                />
              </div>
            </div>

            {/* OPTIONAL BUSINESS CONTEXT */}
            <Card className="bg-muted/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Brain className="h-4 w-4" /> Additional Business Context
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Company Description</Label>
                  <CardDescription>
                    Short description to improve AI recommendations
                  </CardDescription>
                  <Input
                    placeholder="Business description"
                    value={businessContext.description}
                    onChange={(e) =>
                      setBusinessContext({
                        ...businessContext,
                        description: e.target.value
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Past Sales Transaction PDF</Label>
                  <Input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) =>
                      setBusinessContext({
                        ...businessContext,
                        companyPdf: e.target.files?.[0] || null
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Button type="submit" disabled={loading}>
              {loading ? "Generating..." : "Generate AI Recommendations"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ✅ AI Recommendations Card */}
      {aiResults && (
        <Card className="mt-6 bg-green-50 border-green-300">
          <CardHeader>
            <CardTitle>AI Recommendations</CardTitle>
            <CardDescription>
              Based on your inventory and business context
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap">{JSON.stringify(aiResults, null, 2)}</pre>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default InventoryForm;
