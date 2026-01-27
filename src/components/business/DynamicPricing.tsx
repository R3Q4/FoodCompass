import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, LogOut, Package, BarChart3, ClipboardList } from "lucide-react";

const DynamicPricing = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [companyDescription, setCompanyDescription] = useState("");
  const [companyPdf, setCompanyPdf] = useState<File | null>(null);
  const [transactionPdf, setTransactionPdf] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch previously saved data
  useEffect(() => {
    async function fetchBusinessInfo() {
      try {
        const res = await fetch("/api/business/info");
        const data = await res.json();
        setCompanyDescription(data.description || "");
      } catch (err) {
        console.error("Failed to fetch business info", err);
      }
    }
    fetchBusinessInfo();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("description", companyDescription);
      if (companyPdf) formData.append("companyPdf", companyPdf);
      if (transactionPdf) formData.append("transactionPdf", transactionPdf);

      const res = await fetch("/api/business/info", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to save business info");

      alert("Information saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving information");
    } finally {
      setLoading(false);
    }
  };

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Business Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your surplus inventory and update your business information.
          </p>
        </div>

        <Tabs defaultValue="business-info" className="space-y-6">
          <TabsList>
            <TabsTrigger
              value="business-info"
              className="gap-2"
            >
              <Leaf className="h-4 w-4" />
              Business Info
            </TabsTrigger>
            <TabsTrigger
              value="inventory"
              className="gap-2"
              onClick={() => navigate("/business")}
            >
              <Package className="h-4 w-4" />
              Inventory
            </TabsTrigger>
            <TabsTrigger
              value="requests"
              className="gap-2"
              onClick={() => navigate("/business/requests")}
            >
              <ClipboardList className="h-4 w-4" />
              Requests
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="gap-2"
              onClick={() => navigate("/business/analytics")}
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Business Info Content */}
          <TabsContent value="business-info">
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Upload your company info PDF, previous transaction records, or add a description for more accurate recommendations.
                </p>
              </CardHeader>

              {/*add company name and location*/}
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-description">Business</Label>
                  <Input
                    id="company-description"
                    value={companyDescription}
                    onChange={(e) => setCompanyDescription(e.target.value)}
                    placeholder="Short description about your company"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-pdf">Company Info PDF</Label>
                  <Input
                    id="company-pdf"
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setCompanyPdf(e.target.files?.[0] || null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transaction-pdf">Previous Transactions PDF</Label>
                  <Input
                    id="transaction-pdf"
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setTransactionPdf(e.target.files?.[0] || null)}
                  />
                </div>

                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? "Saving..." : "Save Information"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DynamicPricing;
