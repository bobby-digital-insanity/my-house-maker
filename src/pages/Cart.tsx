import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { authService, cartService, type User } from "@/lib/supabase";
import { toast } from "sonner";
import { Trash2, ShoppingBag } from "lucide-react";

interface CartItem {
  id: string;
  room_type: string;
  style: string;
  price: number;
}

const Cart = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCart = async () => {
      const { data } = await authService.getSession();
      if (data?.session?.user) {
        setUser(data.session.user);
        await fetchCartItems(data.session.user.id);
      } else {
        // Guest user
        await fetchCartItems();
      }
    };

    loadCart();

    const subscription = authService.onAuthStateChange((session, user) => {
      setUser(user);
      if (user) {
        fetchCartItems(user.id);
      } else {
        fetchCartItems();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const fetchCartItems = async (userId?: string) => {
    setLoading(true);
    const { data, error } = await cartService.getCartItems(userId);
    if (error) {
      toast.error("Failed to load cart");
    } else {
      setCartItems(data || []);
    }
    setLoading(false);
  };

  const handleRemoveItem = async (itemId: string) => {
    const { error } = await cartService.removeFromCart(itemId, user?.id);
    if (error) {
      toast.error("Failed to remove item");
    } else {
      setCartItems(cartItems.filter((item) => item.id !== itemId));
      toast.success("Item removed from cart");
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + Number(item.price), 0);

  const handleCheckout = () => {
    navigate("/checkout");
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} cartCount={cartItems.length} />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Your Cart</h1>

        {cartItems.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Start building your dream home by adding room styles
              </p>
              <Button onClick={() => navigate("/customize")}>
                Start Customizing
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.room_type}</h3>
                      <p className="text-muted-foreground">{item.style} Style</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-bold">
                        ${Number(item.price).toLocaleString()}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Trash2 className="h-5 w-5 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-muted/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg">Subtotal</span>
                  <span className="text-2xl font-bold">
                    ${totalPrice.toLocaleString()}
                  </span>
                </div>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
