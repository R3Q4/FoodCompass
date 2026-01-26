import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useInventory } from "@/hooks/useInventory";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from "recharts";
import { Leaf, LogOut, ArrowLeft, TrendingUp, Package, DollarSign, Percent, Users } from "lucide-react";

const BusinessAnalytics = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { inventory, bids, donations } = useInventory();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (user?.role !== 'business') {
      navigate('/user');
    }
  }, [isAuthenticated, user, navigate]);

  const businessInventory = inventory.filter(item => item.businessId === user?.id);

  // Calculate analytics data
  const totalItems = businessInventory.length;
  const totalValue = businessInventory.reduce((sum, item) => sum + (item.originalPrice * item.quantity), 0);
  const activeItems = businessInventory.filter(item => item.status === 'active').length;
  const itemsWithBids = businessInventory.filter(item => item.status === 'bidding').length;
  const donatedItems = businessInventory.filter(item => item.status === 'donated').length;

  // Category distribution
  const categoryData = businessInventory.reduce((acc, item) => {
    const existing = acc.find(c => c.name === item.category);
    if (existing) {
      existing.value += item.quantity;
    } else {
      acc.push({ name: item.category, value: item.quantity });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // Strategy distribution
  const strategyData = [
    { name: 'Price Reduction', value: businessInventory.filter(i => i.aiRecommendation?.strategy === 'price_reduction').length, color: '#f59e0b' },
    { name: 'Donation', value: businessInventory.filter(i => i.aiRecommendation?.strategy === 'donation').length, color: '#22c55e' },
    { name: 'Bidding', value: businessInventory.filter(i => i.aiRecommendation?.strategy === 'bidding').length, color: '#8b5cf6' }
  ].filter(s => s.value > 0);

  // Urgency distribution
  const urgencyData = [
    { name: 'Critical', value: businessInventory.filter(i => i.aiRecommendation?.urgencyLevel === 'critical').length, fill: 'hsl(var(--destructive))' },
    { name: 'High', value: businessInventory.filter(i => i.aiRecommendation?.urgencyLevel === 'high').length, fill: '#f97316' },
    { name: 'Medium', value: businessInventory.filter(i => i.aiRecommendation?.urgencyLevel === 'medium').length, fill: '#eab308' },
    { name: 'Low', value: businessInventory.filter(i => i.aiRecommendation?.urgencyLevel === 'low').length, fill: '#22c55e' }
  ].filter(u => u.value > 0);

  // Potential savings from AI recommendations
  const potentialSavings = businessInventory
    .filter(item => item.aiRecommendation?.suggestedPrice)
    .reduce((sum, item) => {
      const originalTotal = item.originalPrice * item.quantity;
      const suggestedTotal = (item.aiRecommendation?.suggestedPrice || item.originalPrice) * item.quantity;
      return sum + suggestedTotal;
    }, 0);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated || user?.role !== 'business') {
    return null;
  }

  const COLORS = ['hsl(var(--primary))', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4'];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
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
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/business')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Insights and recommendations for your surplus inventory
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItems}</div>
              <p className="text-xs text-muted-foreground">{activeItems} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Original value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Potential Recovery</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${potentialSavings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">With AI pricing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Community Impact</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{donatedItems}</div>
              <p className="text-xs text-muted-foreground">Items for donation</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Strategy Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>AI Strategy Recommendations</CardTitle>
              <CardDescription>Recommended actions based on expiry and quantity</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              {strategyData.length > 0 ? (
                <ChartContainer
                  config={{
                    value: { label: "Items" }
                  }}
                >
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
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No data available yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Urgency Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Urgency Levels</CardTitle>
              <CardDescription>Items by time-to-action required</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              {urgencyData.length > 0 ? (
                <ChartContainer
                  config={{
                    value: { label: "Items" }
                  }}
                >
                  <BarChart data={urgencyData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {urgencyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No data available yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Inventory by Category</CardTitle>
              <CardDescription>Distribution of surplus items across categories</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              {categoryData.length > 0 ? (
                <ChartContainer
                  config={{
                    value: { label: "Quantity" }
                  }}
                >
                  <BarChart data={categoryData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No data available yet. Add inventory items to see analytics.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>AI Insights & Recommendations</CardTitle>
            <CardDescription>Actionable insights to optimize your surplus management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {businessInventory.filter(i => i.aiRecommendation?.urgencyLevel === 'critical' || i.aiRecommendation?.urgencyLevel === 'high').length > 0 && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <h4 className="font-medium text-destructive mb-2">⚠️ Urgent Action Required</h4>
                  <p className="text-sm text-muted-foreground">
                    You have {businessInventory.filter(i => i.aiRecommendation?.urgencyLevel === 'critical').length} critical and {businessInventory.filter(i => i.aiRecommendation?.urgencyLevel === 'high').length} high-urgency items.
                    Consider applying AI recommendations immediately to prevent waste.
                  </p>
                </div>
              )}

              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <h4 className="font-medium text-primary mb-2">💡 Optimization Tip</h4>
                <p className="text-sm text-muted-foreground">
                  {strategyData.find(s => s.name === 'Bidding')?.value 
                    ? `Consider opening ${strategyData.find(s => s.name === 'Bidding')?.value} items for bidding to potentially recover more value than standard discounting.`
                    : 'Add more inventory items to receive personalized AI recommendations for maximizing value recovery.'}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <h4 className="font-medium text-green-700 mb-2">🌱 Sustainability Impact</h4>
                <p className="text-sm text-muted-foreground">
                  {donatedItems > 0 
                    ? `Your ${donatedItems} donation items are making a positive impact on your community while reducing food waste.`
                    : 'Consider marking near-expiry items for donation to support your community and reduce waste.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default BusinessAnalytics;
