import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Leaf, Building2, User } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    email: '', 
    password: '', 
    confirmPassword: '',
    role: 'normal' as UserRole,
    businessName: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const success = await login(loginData.email, loginData.password, null);
    
    if (success) {
      toast({ title: "Welcome back!", description: "Successfully logged in." });
      // Navigate based on stored user role
      const user = JSON.parse(localStorage.getItem('foodsaver_user') || '{}');
      navigate(user.role === 'business' ? '/business' : '/user');
    } else {
      toast({ 
        title: "Login failed", 
        description: "Invalid email or password.", 
        variant: "destructive" 
      });
    }
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      toast({ 
        title: "Passwords don't match", 
        description: "Please make sure your passwords match.", 
        variant: "destructive" 
      });
      return;
    }

    if (registerData.role === 'business' && !registerData.businessName.trim()) {
      toast({ 
        title: "Business name required", 
        description: "Please enter your business name.", 
        variant: "destructive" 
      });
      return;
    }
    
    setIsLoading(true);
    
    const success = await register(
      registerData.email, 
      registerData.password, 
      registerData.role,
      registerData.businessName
    );
    
    if (success) {
      toast({ title: "Account created!", description: "Welcome to FoodSaver." });
      navigate(registerData.role === 'business' ? '/business' : '/user');
    } else {
      toast({ 
        title: "Registration failed", 
        description: "This email is already registered.", 
        variant: "destructive" 
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div 
            className="inline-flex items-center gap-2 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <Leaf className="h-10 w-10 text-primary" />
            <span className="text-3xl font-bold text-foreground">FoodSaver</span>
          </div>
          <p className="text-muted-foreground mt-2">
            Reduce waste, recover value
          </p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <Tabs defaultValue="login" className="w-full">
            <CardHeader className="pb-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
            </CardHeader>
            
            <CardContent>
              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="mt-0">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-3">
                    <Label>Account Type</Label>
                    <RadioGroup
                      value={registerData.role || 'normal'}
                      onValueChange={(value) => setRegisterData({ ...registerData, role: value as UserRole })}
                      className="grid grid-cols-2 gap-4"
                    >
                      <Label
                        htmlFor="role-business"
                        className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                          registerData.role === 'business' 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem value="business" id="role-business" className="sr-only" />
                        <Building2 className={`h-8 w-8 mb-2 ${registerData.role === 'business' ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className="font-medium">Business</span>
                        <span className="text-xs text-muted-foreground text-center">
                          List surplus inventory
                        </span>
                      </Label>
                      <Label
                        htmlFor="role-normal"
                        className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                          registerData.role === 'normal' 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem value="normal" id="role-normal" className="sr-only" />
                        <User className={`h-8 w-8 mb-2 ${registerData.role === 'normal' ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className="font-medium">Individual</span>
                        <span className="text-xs text-muted-foreground text-center">
                          Bid or claim donations
                        </span>
                      </Label>
                    </RadioGroup>
                  </div>

                  {registerData.role === 'business' && (
                    <div className="space-y-2">
                      <Label htmlFor="business-name">Business Name</Label>
                      <Input
                        id="business-name"
                        placeholder="Your Business Name"
                        value={registerData.businessName}
                        onChange={(e) => setRegisterData({ ...registerData, businessName: e.target.value })}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="you@example.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Login;
