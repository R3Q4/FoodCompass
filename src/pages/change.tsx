import { useParams, useNavigate } from "react-router-dom";
import { useInventory } from "@/hooks/useInventory";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Leaf } from "lucide-react";
import AI from "@/pages/ai";
import PriceGraph from "./PriceGraph";

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
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground mb-4">Item not found.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
      </div>
    );
  }

  const handleSubmit = () => {
    updateItemPrice(item.id, newPrice);
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4 flex items-center gap-3">
          <Leaf className="h-6 w-6 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-800">FoodSaver</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-10">
        {/* Back Button */}
        <Button
          variant="outline"
          className="mb-8"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>

        {/* Page Title */}
        <h2 className="text-3xl font-semibold text-gray-800 mb-10">
          Change Price for <span className="text-green-600">{item.name}</span>
        </h2>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* LEFT: Price Card */}
        {/* LEFT: Price Card */}
        <div className="bg-white shadow rounded-lg p-6 flex flex-col justify-center items-center space-y-6">
        <p className="text-gray-500 text-center">
            Original Price: <span className="font-medium">${item.originalPrice.toFixed(2)}</span>
        </p>
        {item.aiRecommendation && (
            <p className="text-gray-500 text-center">
            AI Suggested Price: <span className="font-medium">${item.aiRecommendation.suggestedPrice.toFixed(2)}</span>
            </p>
        )}

        <label className="flex flex-col gap-2 w-full max-w-xs">
            <span className="text-gray-700 font-medium text-center">Adjust Price</span>
            <input
            type="range"
            min={item.originalPrice * 0.5}
            max={item.originalPrice * 1.2}
            step={0.1}
            value={newPrice}
            onChange={(e) => setNewPrice(Number(e.target.value))}
            className="w-full accent-green-600"
            />
            <p className="text-gray-600 text-center">New Price: <span className="font-semibold">${newPrice.toFixed(2)}</span></p>
        </label>

        <div className="flex gap-4 mt-4 w-full max-w-xs">
            <Button className="flex-1" onClick={handleSubmit}>Apply</Button>
            <Button className="flex-1" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
        </div>


          {/* RIGHT: Graph & AI */}
          <div className="space-y-8">
            <div className="bg-white shadow rounded-lg p-6">
              <PriceGraph
                originalPrice={item.originalPrice}
                aiSuggestedPrice={item.aiRecommendation?.suggestedPrice}
                currentPrice={newPrice}
              />
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <AI inventoryItem={item} onClose={() => {}} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChangePricePage;
