import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { useInventory } from "@/hooks/useInventory";
import { getStrategyLabel, getUrgencyColor } from "@/lib/aiRecommendation";
import { InventoryItem } from "@/types/inventory";
import { Package, TrendingDown, Heart, Gavel, Trash2, Sparkles, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import AI from "@/pages/ai";

const InventoryList = () => {
  const { user } = useAuth();
  const { inventory, updateItemStatus, deleteInventoryItem, getItemBids, getItemDonations } = useInventory();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [selectedItemForAI, setSelectedItemForAI] = useState<InventoryItem | null>(null);

  const businessInventory = inventory.filter(item => item.businessId === user?.id);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleApplyStrategy = (item: InventoryItem) => {
    if (!item.aiRecommendation) return;

    if (item.aiRecommendation.strategy === "price_reduction") {
      navigate(`/business/change/${item.id}`);
      return;
    }

    const statusMap: Record<string, InventoryItem["status"]> = {
      donation: "donated",
      bidding: "bidding",
      dispose: "sold",
    };

    const newStatus = statusMap[item.aiRecommendation.strategy];
    updateItemStatus(item.id, newStatus);

    toast({
      title: "Strategy applied!",
      description: `${item.name} is now ${getStrategyLabel(item.aiRecommendation.strategy).toLowerCase()}.`,
    });
  };

  const handleDelete = (itemId: string, itemName: string) => {
    deleteInventoryItem(itemId);
    toast({
      title: "Item removed",
      description: `${itemName} has been removed from inventory.`,
    });
  };

  const getStatusBadge = (status: InventoryItem["status"]) => {
    const variants: Record<string, { label: string; className: string }> = {
      active: { label: "Active", className: "bg-blue-100 text-blue-700" },
      reduced: { label: "Price Reduced", className: "bg-yellow-100 text-yellow-700" },
      donated: { label: "For Donation", className: "bg-green-100 text-green-700" },
      bidding: { label: "Open for Bids", className: "bg-purple-100 text-purple-700" },
      sold: { label: "Sold", className: "bg-gray-100 text-gray-700" },
    };
    const { label, className } = variants[status] || variants.active;
    return <Badge className={className}>{label}</Badge>;
  };

  const getStrategyIcon = (strategy?: string) => {
    switch (strategy) {
      case "price_reduction":
        return <TrendingDown className="h-4 w-4" />;
      case "donation":
        return <Heart className="h-4 w-4" />;
      case "bidding":
        return <Gavel className="h-4 w-4" />;
      case "dispose":
        return <Trash2 className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (businessInventory.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No inventory items yet</h3>
          <p className="text-muted-foreground text-center">
            Add your first surplus item above to get AI-powered recommendations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" /> Your Inventory
          </CardTitle>
          <CardDescription>Manage your surplus items and apply AI recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>AI Recommendation</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {businessInventory.map(item => {
                  const daysLeft = getDaysUntilExpiry(item.expiryDate);
                  const bids = getItemBids(item.id);
                  const donations = getItemDonations(item.id);

                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.category}</p>
                        </div>
                      </TableCell>
                      <TableCell>{item.quantity} {item.unit}</TableCell>
                      <TableCell>
                        <div>
                          <p>${item.originalPrice.toFixed(2)}</p>
                          {item.aiRecommendation?.suggestedPrice && (
                            <p className="text-sm text-green-600">
                              → ${item.aiRecommendation.suggestedPrice.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{formatDate(item.expiryDate)}</p>
                          <p className={`text-sm ${daysLeft <= 3 ? "text-red-600 font-medium" : "text-muted-foreground"}`}>
                            {daysLeft} days left
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {getStatusBadge(item.status)}
                          {bids.length > 0 && <p className="text-xs text-muted-foreground">{bids.length} bids</p>}
                          {donations.length > 0 && <p className="text-xs text-muted-foreground">{donations.length} claims</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.aiRecommendation ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge className={getUrgencyColor(item.aiRecommendation.urgencyLevel)}>
                                {item.aiRecommendation.urgencyLevel}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              {getStrategyIcon(item.aiRecommendation.strategy)}
                              <span className="font-medium">{getStrategyLabel(item.aiRecommendation.strategy)}</span>
                            </div>
                            <p className="text-xs text-muted-foreground max-w-xs">
                              {item.aiRecommendation.reasoning.substring(0, 80)}...
                            </p>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-1"
                            onClick={() => setSelectedItemForAI(item)}
                          >
                            <Brain className="h-4 w-4" /> Analyze
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {item.status === "active" && item.aiRecommendation && (
                            <Button size="sm" onClick={() => handleApplyStrategy(item)} className="gap-1">
                              <Sparkles className="h-3 w-3" /> Apply
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id, item.name)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Render AI component for selected item */}
      {selectedItemForAI && (
        <div className="mt-4">
          <AI inventoryItem={selectedItemForAI} onClose={() => setSelectedItemForAI(null)} />
        </div>
      )}
    </>
  );
};

export default InventoryList;
