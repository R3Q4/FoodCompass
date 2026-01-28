import { useParams, useNavigate } from "react-router-dom";
import { useInventory } from "@/hooks/useInventory";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Leaf } from "lucide-react";
import AI from "@/pages/ai";

const ChangePricePage = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const { inventory, updateItemPrice } = useInventory();

  const item = inventory.find(i => i.id === itemId);
  const [newPrice, setNewPrice] = useState(
    item?.aiRecommendation?.suggestedPrice || item?.originalPrice || 0
  );

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">Item not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>
    );
  }

  const handleSubmit = () => {
    updateItemPrice(item.id, newPrice);
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-2">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">FoodSaver</span>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Button variant="outline" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>

        <h1 className="text-2xl font-bold mb-8">
          Change Price for {item.name}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* LEFT */}
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Original Price: ${item.originalPrice.toFixed(2)}
            </p>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">New Price</span>
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(Number(e.target.value))}
                className="border p-2 rounded w-40"
              />
            </label>

            <div className="flex gap-2">
              <Button onClick={handleSubmit}>Apply</Button>
              <Button variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </div>

          {/* RIGHT */}
<div className="flex items-start">
  <AI
    inventoryItem={item}
    onClose={() => {}}
  />
</div>
        </div>
      </div>
    </div>
  );
};

export default ChangePricePage;
