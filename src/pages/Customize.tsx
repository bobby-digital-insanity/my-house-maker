import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RoomCard from "@/components/RoomCard";
import Navbar from "@/components/Navbar";
import { roomTypes } from "@/lib/roomData";
import { authService, cartService } from "@/lib/supabase";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";
import type { User } from "@supabase/supabase-js";

const Customize = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await authService.getSession();
      if (!data.session) {
        navigate("/auth");
        return;
      }
      setUser(data.session.user);
      loadCartCount(data.session.user.id);
    };

    loadUser();

    const subscription = authService.onAuthStateChange((session, user) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(user);
        if (user) loadCartCount(user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const loadCartCount = async (userId: string) => {
    const { data } = await cartService.getCartItems(userId);
    setCartCount(data?.length || 0);
  };

  const handleSelectStyle = (roomId: string, styleId: string) => {
    setSelections((prev) => ({
      ...prev,
      [roomId]: prev[roomId] === styleId ? "" : styleId,
    }));
  };

  const handleAddToCart = async () => {
    if (!user) return;

    const selectedItems = Object.entries(selections).filter(([_, styleId]) => styleId);
    
    if (selectedItems.length === 0) {
      toast.error("Please select at least one room style");
      return;
    }

    setLoading(true);

    try {
      for (const [roomId, styleId] of selectedItems) {
        const room = roomTypes.find((r) => r.id === roomId);
        const style = room?.styles.find((s) => s.id === styleId);

        if (room && style) {
          await cartService.addToCart({
            user_id: user.id,
            room_type: room.name,
            style: style.name,
            price: style.price,
          });
        }
      }

      toast.success(`Added ${selectedItems.length} item(s) to cart`);
      setSelections({});
      loadCartCount(user.id);
      navigate("/cart");
    } catch (error) {
      toast.error("Failed to add items to cart");
    } finally {
      setLoading(false);
    }
  };

  const selectedCount = Object.values(selections).filter(Boolean).length;
  const totalPrice = Object.entries(selections).reduce((sum, [roomId, styleId]) => {
    if (!styleId) return sum;
    const room = roomTypes.find((r) => r.id === roomId);
    const style = room?.styles.find((s) => s.id === styleId);
    return sum + (style?.price || 0);
  }, 0);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} cartCount={cartCount} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Build Your Dream Home</h1>
          <p className="text-muted-foreground text-lg">
            Choose styles for each room to create your perfect custom home
          </p>
        </div>

        <Tabs defaultValue={roomTypes[0].id} className="w-full">
          <TabsList className="w-full flex flex-wrap justify-center gap-2 h-auto bg-muted/50 p-2 mb-8">
            {roomTypes.map((room) => (
              <TabsTrigger
                key={room.id}
                value={room.id}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {room.name}
                {selections[room.id] && (
                  <span className="ml-2 h-2 w-2 rounded-full bg-accent" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {roomTypes.map((room) => (
            <TabsContent key={room.id} value={room.id} className="mt-6">
              <h2 className="text-2xl font-semibold mb-6">{room.name} Styles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {room.styles.map((style) => (
                  <RoomCard
                    key={style.id}
                    style={style}
                    selected={selections[room.id] === style.id}
                    onSelect={() => handleSelectStyle(room.id, style.id)}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {selectedCount > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg p-4">
            <div className="container mx-auto flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {selectedCount} room{selectedCount > 1 ? "s" : ""} selected
                </p>
                <p className="text-2xl font-bold">${totalPrice.toLocaleString()}</p>
              </div>
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={loading}
                className="gap-2"
              >
                <ShoppingCart className="h-5 w-5" />
                {loading ? "Adding..." : "Add to Cart"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Customize;
