import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLDClient } from 'launchdarkly-react-client-sdk';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import { authService, cartService, type User } from "@/lib/supabase";
import { toast } from "sonner";
import { CheckCircle2, UserCircle, User as UserIcon, Sparkles } from "lucide-react";

// Get API URL (same as in supabase.ts)
const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:3001' : `${window.location.protocol}//${window.location.hostname}:3001`);

interface CartItem {
  id: string;
  room_type: string;
  style: string;
  price: number;
}

const Checkout = () => {
  const navigate = useNavigate();
  const ldClient = useLDClient();
  const [user, setUser] = useState<User | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [checkoutTab, setCheckoutTab] = useState<"guest" | "login">("guest");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginMode, setLoginMode] = useState<"signin" | "signup">("signin");
  
  // Form fields for billing information
  const [billingFields, setBillingFields] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    zip: "",
    card: "",
  });

  // Function to fill with demo data
  const fillDemoData = () => {
    setBillingFields({
      name: "John Doe",
      email: user?.email || "john.doe@example.com",
      address: "123 Main Street",
      city: "New York",
      zip: "10001",
      card: "4242 4242 4242 4242",
    });
    toast.success("Demo data filled!");
  };

  useEffect(() => {
    const loadCheckout = async () => {
      const { data } = await authService.getSession();
      
      if (data?.session?.user) {
        setUser(data.session.user);
        const { data: items } = await cartService.getCartItems(data.session.user.id);
        
        if (!items || items.length === 0) {
          navigate("/cart");
          return;
        }

        setCartItems(items);
      } else {
        // Guest checkout
        const { data: items } = await cartService.getCartItems();
        
        if (!items || items.length === 0) {
          navigate("/cart");
          return;
        }

        setCartItems(items);
      }
      
      setLoading(false);
    };

    loadCheckout();

    const subscription = authService.onAuthStateChange((session, user) => {
      setUser(user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const totalPrice = cartItems.reduce((sum, item) => sum + Number(item.price), 0);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      if (loginMode === "signin") {
        const { error } = await authService.signIn(email, password);
        if (error) throw error;
        
        // Migrate guest cart to user account
        const { data } = await authService.getSession();
        if (data?.session?.user) {
          await cartService.migrateGuestCartToUser(data.session.user.id);
          const { data: cartData } = await cartService.getCartItems(data.session.user.id);
          setCartItems(cartData || []);
          setUser(data.session.user);
        }
        
        toast.success("Logged in successfully!");
        setCheckoutTab("guest"); // Switch to checkout form
      } else {
        const { error } = await authService.signUp(email, password, email.split("@")[0]);
        if (error) throw error;
        toast.success("Account created! Please check your email to confirm.");
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setProcessing(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    // Track checkout completion event
    if (ldClient) {
      ldClient.track('checkout-completed', null, totalPrice);
      console.log('✅ Event sent to LaunchDarkly: checkout-completed', { totalPrice });
    }

    // Call Node.js script via local server to log price to server console
    // This runs in the background and doesn't block the checkout flow
    fetch(`${API_URL}/log-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ totalPrice }),
    }).catch((error) => {
      // Silently fail - we don't want to block checkout if logging fails
      console.error('Failed to log checkout to server:', error);
    });

    try {
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Clear cart
      await cartService.clearCart(user?.id);

      setOrderComplete(true);
      toast.success("Order placed successfully!");
    } catch (error) {
      toast.error("Failed to process order");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar user={user} cartCount={0} />
        <div className="container mx-auto px-4 py-8 text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar user={user} cartCount={0} />
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="text-center">
            <CardContent className="pt-16 pb-16">
              <CheckCircle2 className="h-20 w-20 text-accent mx-auto mb-6" />
              <h1 className="text-4xl font-bold mb-4">Order Confirmed!</h1>
              <p className="text-xl text-muted-foreground mb-8">
                Thank you for your purchase. Your dream home design has been confirmed.
              </p>
              <div className="bg-muted/50 rounded-lg p-6 mb-8">
                <p className="text-sm text-muted-foreground mb-2">Order Total</p>
                <p className="text-3xl font-bold">${totalPrice.toLocaleString()}</p>
              </div>
              <Button size="lg" onClick={() => navigate("/")}>
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} cartCount={cartItems.length} />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            {!user ? (
              <Tabs value={checkoutTab} onValueChange={(v) => setCheckoutTab(v as "guest" | "login")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="guest" className="gap-2">
                    <UserIcon className="h-4 w-4" />
                    Guest Checkout
                  </TabsTrigger>
                  <TabsTrigger value="login" className="gap-2">
                    <UserCircle className="h-4 w-4" />
                    Login & Checkout
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="guest" className="mt-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Billing Information</CardTitle>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={fillDemoData}
                          className="gap-2"
                        >
                          <Sparkles className="h-4 w-4" />
                          Fill Demo Data
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handlePlaceOrder} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            placeholder="John Doe"
                            value={billingFields.name}
                            onChange={(e) => setBillingFields({ ...billingFields, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            value={billingFields.email}
                            onChange={(e) => setBillingFields({ ...billingFields, email: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            placeholder="123 Main St"
                            value={billingFields.address}
                            onChange={(e) => setBillingFields({ ...billingFields, address: e.target.value })}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              placeholder="New York"
                              value={billingFields.city}
                              onChange={(e) => setBillingFields({ ...billingFields, city: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="zip">ZIP Code</Label>
                            <Input
                              id="zip"
                              placeholder="10001"
                              value={billingFields.zip}
                              onChange={(e) => setBillingFields({ ...billingFields, zip: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="card">Card Number (Demo)</Label>
                          <Input
                            id="card"
                            placeholder="4242 4242 4242 4242"
                            value={billingFields.card}
                            onChange={(e) => setBillingFields({ ...billingFields, card: e.target.value })}
                            required
                          />
                        </div>
                        
                        <Button
                          type="submit"
                          size="lg"
                          className="w-full"
                          disabled={processing}
                        >
                          {processing ? "Processing..." : `Pay $${totalPrice.toLocaleString()}`}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="login" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{loginMode === "signin" ? "Sign In" : "Create Account"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleAuth} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="auth-email">Email</Label>
                          <Input 
                            id="auth-email"
                            required 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@example.com" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="auth-password">Password</Label>
                          <Input 
                            id="auth-password"
                            required 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••" 
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full"
                          size="lg"
                          disabled={processing}
                        >
                          {processing ? "Processing..." : (loginMode === "signin" ? "Sign In & Continue" : "Create Account")}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full"
                          onClick={() => setLoginMode(loginMode === "signin" ? "signup" : "signin")}
                        >
                          {loginMode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Billing Information</CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={fillDemoData}
                      className="gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      Fill Demo Data
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePlaceOrder} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={billingFields.name}
                        onChange={(e) => setBillingFields({ ...billingFields, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={billingFields.email || user.email}
                        onChange={(e) => setBillingFields({ ...billingFields, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        placeholder="123 Main St"
                        value={billingFields.address}
                        onChange={(e) => setBillingFields({ ...billingFields, address: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          placeholder="New York"
                          value={billingFields.city}
                          onChange={(e) => setBillingFields({ ...billingFields, city: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zip">ZIP Code</Label>
                        <Input
                          id="zip"
                          placeholder="10001"
                          value={billingFields.zip}
                          onChange={(e) => setBillingFields({ ...billingFields, zip: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="card">Card Number (Demo)</Label>
                      <Input
                        id="card"
                        placeholder="4242 4242 4242 4242"
                        value={billingFields.card}
                        onChange={(e) => setBillingFields({ ...billingFields, card: e.target.value })}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={processing}
                    >
                      {processing ? "Processing..." : `Pay $${totalPrice.toLocaleString()}`}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start pb-4 border-b last:border-0"
                  >
                    <div>
                      <p className="font-semibold">{item.room_type}</p>
                      <p className="text-sm text-muted-foreground">{item.style}</p>
                    </div>
                    <span className="font-semibold">
                      ${Number(item.price).toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Total</span>
                    <span>${totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
