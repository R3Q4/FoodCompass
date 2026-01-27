// business dashboard - wrong positioning
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import InventoryForm from "@/components/business/InventoryForm";
import InventoryList from "@/components/business/InventoryList";
import {
  Leaf,
  LogOut,
  Package,
  BarChart3,
  ClipboardList,
  DollarSign,
  TrendingUp,
} from "lucide-react";

const BusinessDashboard = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [businessDescription, setBusinessDescription] = useState("");
  const [transactionsFile, setTransactionsFile] = useState<File | null>(null);

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
    else if (user?.role !== "business") navigate("/user");
  }, [isAuthenticated, user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!isAuthenticated || user?.role !== "business") return null;

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
              Welcome,{" "}
              <span className="font-medium text-foreground">
                {user.businessName || user.email}
              </span>
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Business Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage surplus inventory and optimize pricing before items go to waste
          </p>
        </div>

        <Tabs defaultValue="inventory" className="space-y-6">
          <TabsList>
            <TabsTrigger value="inventory" className="gap-2">
              <Package className="h-4 w-4" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              Requests
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Inventory + Dynamic Pricing */}
          <TabsContent value="inventory" className="space-y-10">
            <InventoryForm />
            <InventoryList />

            {/* Dynamic Pricing Section */}
            <div className="pt-8 border-t border-border space-y-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Dynamic Pricing Context
                </h2>
                <p className="text-muted-foreground">
                  Provide context to generate smarter pricing and action recommendations
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Business Description</CardTitle>
                  <CardDescription>
                    Describe your business model, customers, or timing patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="e.g. Café near campus, peak sales before noon, leftover pastries daily..."
                    value={businessDescription}
                    onChange={(e) => setBusinessDescription(e.target.value)}
                    rows={4}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Past Transactions</CardTitle>
                  <CardDescription>
                    Upload previous sales data (PDF or CSV)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Input
                    type="file"
                    accept=".pdf,.csv"
                    onChange={(e) => setTransactionsFile(e.target.files?.[0] || null)}
                  />
                  {transactionsFile && (
                    <p className="text-sm text-green-600 mt-2">
                      {transactionsFile.name} uploaded
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* AI Recommendation Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    AI Pricing Recommendations
                  </CardTitle>
                  <CardDescription>
                    Preview of actions the system may suggest
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="p-3 rounded-md bg-muted">
                    🔻 Apply <strong>15–25%</strong> discount 2 hours before closing
                  </div>
                  <div className="p-3 rounded-md bg-muted">
                    📦 Bundle similar surplus items to increase conversion
                  </div>
                  <div className="p-3 rounded-md bg-muted">
                    ❤️ Schedule donation if inventory remains unsold
                  </div>
                </CardContent>
              </Card>

              <Button disabled className="bg-blue-600 text-white">
                Generate Pricing Actions (Coming Soon)
              </Button>
            </div>
          </TabsContent>

          {/* Requests */}
          <TabsContent value="requests">
            <div className="text-center py-12 text-muted-foreground">
              View and manage bids and donation claims here
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default BusinessDashboard;
