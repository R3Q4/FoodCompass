import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useInventory } from "@/hooks/useInventory";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaf, LogOut, Package, BarChart3, ClipboardList, DollarSign, TrendingUp, Users } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const BusinessAnalytics = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { inventory } = useInventory();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
    else if (user?.role !== "business") navigate("/user");
  }, [isAuthenticated, user, navigate]);

  const businessInventory = inventory.filter((item) => item.businessId === user?.id);

  // Analytics calculations
  const totalItems = businessInventory.length;
  const totalValue = businessInventory.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0);
  const activeItems = businessInventory.filter((item) => item.status === "active").length;
  const donatedItems = businessInventory.filter((item) => item.status === "donated").length;

  // Category data
  const categoryData = businessInventory.reduce((acc: { name: string; value: number }[], item) => {
    const existing = acc.find((c) => c.name === item.category);
    if (existing) existing.value += item.quantity;
    else acc.push({ name: item.category, value: item.quantity });
    return acc;
  }, []);

  // Strategy data
  const strategyData = [
    { name: "Price Reduction", value: businessInventory.filter((i) => i.aiRecommendation?.strategy === "price_reduction").length, color: "#f59e0b" },
    { name: "Donation", value: businessInventory.filter((i) => i.aiRecommendation?.strategy === "donation").length, color: "#22c55e" },
    { name: "Bidding", value: businessInventory.filter((i) => i.aiRecommendation?.strategy === "bidding").length, color: "#8b5cf6" }
  ].filter((s) => s.value > 0);

  // Urgency data
  const urgencyData = [
    { name: "Critical", value: businessInventory.filter((i) => i.aiRecommendation?.urgencyLevel === "critical").length, fill: "hsl(var(--destructive))" },
    { name: "High", value: businessInventory.filter((i) => i.aiRecommendation?.urgencyLevel === "high").length, fill: "#f97316" },
    { name: "Medium", value: businessInventory.filter((i) => i.aiRecommendation?.urgencyLevel === "medium").length, fill: "#eab308" },
    { name: "Low", value: businessInventory.filter((i) => i.aiRecommendation?.urgencyLevel === "low").length, fill: "#22c55e" }
  ].filter((u) => u.value > 0);

  const potentialSavings = businessInventory.reduce((sum, item) => {
    const suggested = item.aiRecommendation?.suggestedPrice || item.originalPrice;
    return sum + suggested * item.quantity;
  }, 0);

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
              Welcome, <span className="font-medium text-foreground">{user.businessName || user.email}</span>
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content with Tabs */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Business Dashboard</h1>
          <p className="text-muted-foreground">
            Insights and recommendations for your surplus inventory
          </p>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList>

            <TabsTrigger
              value="inventory"
              className="gap-2"
              onClick={() => navigate("/business")}
            >
              <Package className="h-4 w-4" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              Requests
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalItems}</div>
                  <p className="text-xs text-muted-foreground">{activeItems} active</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Original value</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Potential Recovery</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">${potentialSavings.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">With AI pricing</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Community Impact</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{donatedItems}</div>
                  <p className="text-xs text-muted-foreground">Items for donation</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Strategy Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>AI Strategy Recommendations</CardTitle>
                  <CardDescription>Recommended actions based on expiry and quantity</CardDescription>
                </CardHeader>
                <CardContent className="h-64">
                  {strategyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={strategyData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {strategyData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">No data available yet</div>
                  )}
                </CardContent>
              </Card>

              {/* Urgency Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Urgency Levels</CardTitle>
                  <CardDescription>Items by time-to-action required</CardDescription>
                </CardHeader>
                <CardContent className="h-64">
                  {urgencyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={urgencyData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {urgencyData.map((entry, index) => (
                            <Cell key={index} fill={entry.fill} />
                          ))}
                        </Bar>
                        <Tooltip />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">No data available yet</div>
                  )}
                </CardContent>
              </Card>

              {/* Category Bar Chart */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Inventory by Category</CardTitle>
                  <CardDescription>Distribution of surplus items across categories</CardDescription>
                </CardHeader>
                <CardContent className="h-64">
                  {categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        <Tooltip />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      No data available yet. Add inventory items to see analytics.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default BusinessAnalytics;
