import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import { authService, cartService } from "@/lib/supabase";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface CartItem {
  id: string;
  room_type: string;
  style: string;
  price: number;
}

const Checkout = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  useEffect(() => {
    const loadCheckout = async () => {
      const { data } = await authService.getSession();
      if (!data.session) {
        navigate("/auth");
        return;
      }

      setUser(data.session.user);
      const { data: items } = await cartService.getCartItems(data.session.user.id);
      
      if (!items || items.length === 0) {
        navigate("/cart");
        return;
      }

      setCartItems(items);
      setLoading(false);
    };

    loadCheckout();
  }, [navigate]);

  const totalPrice = cartItems.reduce((sum, item) => sum + Number(item.price), 0);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    setProcessing(true);

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Clear cart
    const { error } = await cartService.clearCart(user.id);
    
    if (error) {
      toast.error("Failed to process order");
      setProcessing(false);
    } else {
      setOrderComplete(true);
      setProcessing(false);
      toast.success("Order placed successfully!");
    }
  };

  if (loading || !user) {
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
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePlaceOrder} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="John Doe" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      defaultValue={user.email}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" placeholder="123 Main St" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" placeholder="New York" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input id="zip" placeholder="10001" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="card">Card Number (Demo)</Label>
                    <Input
                      id="card"
                      placeholder="4242 4242 4242 4242"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={processing}
                  >
                    {processing ? "Processing..." : "Place Order"}
                  </Button>
                </form>
              </CardContent>
            </Card>
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
