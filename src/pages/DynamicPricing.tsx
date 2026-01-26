import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useInventory } from "@/hooks/useInventory";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Leaf, LogOut, ArrowLeft, Package, DollarSign } from "lucide-react";

const DynamicPricing = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { inventory } = useInventory();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if not authorized
  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
    else if (user?.role !== "business") navigate("/user");
  }, [isAuthenticated, user, navigate]);

  // Get the inventory item passed from dashboard
  const itemId = (location.state as { itemId: string })?.itemId;
  const item = inventory.find((i) => i.id === itemId);

  const [pastSalesFile, setPastSalesFile] = useState<File | null>(null);
  const [businessInfoFile, setBusinessInfoFile] = useState<File | null>(null);
  const [companyContext, setCompanyContext] = useState<string>("");

  if (!isAuthenticated || user?.role !== "business") return null;
  if (!item) return <p className="p-4 text-red-600">Item not found</p>;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSubmit = () => {
    // Normally: send PDFs + context to backend
    alert("Files submitted. Dynamic pricing process initiated!");
    navigate("/business");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <Leaf className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">FoodSaver</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, <span className="font-medium text-foreground">{user.businessName || user.email}</span>
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Back + Title */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/business")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dynamic Pricing for {item.name}</h1>
            <p className="text-muted-foreground">
              Submit your past sales records and business information for more accurate pricing suggestions
            </p>
          </div>
        </div>

        {/* PDF Upload Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Past Sales Records (PDF)</CardTitle>
              <CardDescription>Upload your historical sales data.</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPastSalesFile(e.target.files?.[0] || null)}
              />
              {pastSalesFile && <p className="text-sm text-green-600 mt-2">{pastSalesFile.name}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Business Info (PDF)</CardTitle>
              <CardDescription>Upload documents describing your business.</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                type="file"
                accept="application/pdf"
                onChange={(e) => setBusinessInfoFile(e.target.files?.[0] || null)}
              />
              {businessInfoFile && <p className="text-sm text-green-600 mt-2">{businessInfoFile.name}</p>}
            </CardContent>
          </Card>
        </div>

        {/* Optional Context Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Optional Company Context</CardTitle>
            <CardDescription>
              Provide additional information to help refine the dynamic pricing suggestion.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Label>Company Context</Label>
            <Textarea
              placeholder="Describe your company, target market, or special circumstances..."
              value={companyContext}
              onChange={(e) => setCompanyContext(e.target.value)}
              rows={5}
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!pastSalesFile || !businessInfoFile}
          className="bg-blue-600 text-white"
        >
          Submit for Dynamic Pricing
        </Button>
      </main>
    </div>
  );
};

export default DynamicPricing;
