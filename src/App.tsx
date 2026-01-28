import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import BusinessDashboard from "./pages/BusinessDashboard";
import BusinessAnalytics from "./pages/BusinessAnalytics";
import DynamicPricing from "@/components/business/DynamicPricing";
import UserDashboard from "./pages/UserDashboard";
import NotFound from "./pages/NotFound";
import ChangePricePage from "@/pages/change";
import AI from "@/pages/ai";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} /> 
            <Route path="/login" element={<Login />} />
            <Route path="/business" element={<BusinessDashboard />} />
            <Route path="/business/analytics" element={<BusinessAnalytics />} />
            <Route path="/user" element={<UserDashboard />} />
            <Route path="business/info" element={<DynamicPricing />} />
            <Route path="/business/change/:itemId" element={<ChangePricePage />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
