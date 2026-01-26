import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, TrendingDown, Heart, Gavel, ArrowRight, BarChart3, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Recommendations",
      description: "Get smart suggestions on pricing, donations, and bidding strategies based on expiry dates and market conditions."
    },
    {
      icon: TrendingDown,
      title: "Dynamic Price Reduction",
      description: "Automatically calculate optimal discounts to move surplus inventory while maximizing profit recovery."
    },
    {
      icon: Heart,
      title: "Community Donations",
      description: "Connect with local organizations and individuals who can benefit from your surplus food items."
    },
    {
      icon: Gavel,
      title: "Competitive Bidding",
      description: "Open bidding system allows bulk buyers to compete, potentially recovering more value than standard discounts."
    },
    {
      icon: BarChart3,
      title: "Business Analytics",
      description: "Track inventory trends, waste reduction, and profit optimization with detailed analytics dashboards."
    },
    {
      icon: Leaf,
      title: "Sustainability Impact",
      description: "Measure your environmental impact and contribute to reducing food waste in your community."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-background" />
        <nav className="relative container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">FoodSaver</span>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => navigate('/login')}>
              Sign In
            </Button>
            <Button onClick={() => navigate('/login')}>
              Get Started
            </Button>
          </div>
        </nav>

        <div className="relative container mx-auto px-4 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            AI-Powered Food Surplus Management
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 max-w-4xl mx-auto leading-tight">
            Turn Food Surplus Into
            <span className="text-primary"> Opportunity</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Reduce waste, recover profit, and make a positive impact. Our AI helps businesses 
            make smart decisions about surplus inventory through pricing, donations, and bidding.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2" onClick={() => navigate('/login')}>
              Start Saving Food <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
              Browse Available Items
            </Button>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Smart Solutions for Food Surplus
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform combines AI technology with community engagement to create 
              a sustainable approach to managing food inventory.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-border/50 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <Card className="bg-primary text-primary-foreground border-0">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Reduce Food Waste?
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                Join businesses and individuals working together to create a more 
                sustainable food ecosystem.
              </p>
              <Button 
                size="lg" 
                variant="secondary" 
                className="gap-2"
                onClick={() => navigate('/login')}
              >
                Get Started Today <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">FoodSaver</span>
          </div>
          <p className="text-sm">
            © 2024 FoodSaver. Reducing food waste, one item at a time.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
