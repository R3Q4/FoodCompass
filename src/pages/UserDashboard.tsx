import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useInventory } from "@/hooks/useInventory";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Leaf, LogOut, Gavel, Heart, Clock, MapPin, Building2 } from "lucide-react";

const UserDashboard = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { getAvailableForBidding, getAvailableForDonation, placeBid, claimDonation, loadData } = useInventory();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [bidAmount, setBidAmount] = useState<string>('');
  const [claimQuantity, setClaimQuantity] = useState<string>('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (user?.role !== 'normal') {
      navigate('/business');
    }
    loadData();
  }, [isAuthenticated, user, navigate]);

  const biddingItems = getAvailableForBidding();
  const donationItems = getAvailableForDonation();

  const handlePlaceBid = (itemId: string) => {
    if (!user || !bidAmount) return;
    
    placeBid(itemId, user.id, user.email, parseFloat(bidAmount));
    toast({
      title: "Bid placed!",
      description: `Your bid of $${bidAmount} has been submitted.`
    });
    setBidAmount('');
  };

  const handleClaimDonation = (itemId: string, maxQuantity: number) => {
    if (!user || !claimQuantity) return;
    
    const qty = parseInt(claimQuantity);
    if (qty > maxQuantity) {
      toast({
        title: "Invalid quantity",
        description: `Maximum available is ${maxQuantity} units.`,
        variant: "destructive"
      });
      return;
    }
    
    claimDonation(itemId, user.id, user.email, qty);
    toast({
      title: "Donation claimed!",
      description: `Your request for ${qty} units has been submitted.`
    });
    setClaimQuantity('');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (!isAuthenticated || user?.role !== 'normal') {
    return null;
  }

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
              Welcome, <span className="font-medium text-foreground">{user.email}</span>
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Available Items</h1>
          <p className="text-muted-foreground">
            Browse surplus food items available for bidding or donation
          </p>
        </div>

        <Tabs defaultValue="bidding" className="space-y-6">
          <TabsList>
            <TabsTrigger value="bidding" className="gap-2">
              <Gavel className="h-4 w-4" />
              Open for Bidding ({biddingItems.length})
            </TabsTrigger>
            <TabsTrigger value="donations" className="gap-2">
              <Heart className="h-4 w-4" />
              Donations ({donationItems.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bidding">
            {biddingItems.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Gavel className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No items for bidding</h3>
                  <p className="text-muted-foreground text-center">
                    Check back later for new bidding opportunities.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {biddingItems.map((item) => (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{item.name}</CardTitle>
                          <CardDescription>{item.category}</CardDescription>
                        </div>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                          Bidding
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Building2 className="h-4 w-4" />
                          {item.businessName}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {item.location}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          Expires {formatDate(item.expiryDate)}
                        </div>
                        <div className="font-medium text-foreground">
                          {item.quantity} {item.unit}
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t">
                        <p className="text-sm text-muted-foreground mb-1">Original Price</p>
                        <p className="text-xl font-bold text-foreground">${item.originalPrice.toFixed(2)}</p>
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full gap-2">
                            <Gavel className="h-4 w-4" />
                            Place Bid
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Place a Bid</DialogTitle>
                            <DialogDescription>
                              Enter your bid amount for {item.name} ({item.quantity} {item.unit})
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Your Bid Amount</Label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                <Input
                                  type="number"
                                  min="0.01"
                                  step="0.01"
                                  placeholder="Enter amount"
                                  value={bidAmount}
                                  onChange={(e) => setBidAmount(e.target.value)}
                                  className="pl-7"
                                />
                              </div>
                            </div>
                            <Button onClick={() => handlePlaceBid(item.id)} className="w-full">
                              Submit Bid
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="donations">
            {donationItems.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No donations available</h3>
                  <p className="text-muted-foreground text-center">
                    Check back later for donation opportunities.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {donationItems.map((item) => (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{item.name}</CardTitle>
                          <CardDescription>{item.category}</CardDescription>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          Free
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Building2 className="h-4 w-4" />
                          {item.businessName}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {item.location}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          Expires {formatDate(item.expiryDate)}
                        </div>
                        <div className="font-medium text-foreground">
                          {item.quantity} {item.unit} available
                        </div>
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full gap-2" variant="secondary">
                            <Heart className="h-4 w-4" />
                            Claim Donation
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Claim Donation</DialogTitle>
                            <DialogDescription>
                              How many {item.unit} of {item.name} would you like? (Max: {item.quantity})
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Quantity</Label>
                              <Input
                                type="number"
                                min="1"
                                max={item.quantity}
                                placeholder="Enter quantity"
                                value={claimQuantity}
                                onChange={(e) => setClaimQuantity(e.target.value)}
                              />
                            </div>
                            <Button onClick={() => handleClaimDonation(item.id, item.quantity)} className="w-full">
                              Submit Request
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default UserDashboard;
