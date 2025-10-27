import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// add in LaunchDarkly SDK
import { useFlags } from 'launchdarkly-react-client-sdk';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import RoomCard from "@/components/RoomCard";
import Navbar from "@/components/Navbar";
import { roomTypes } from "@/lib/roomData";
import { manCaveTeams } from "@/lib/manCaveData";
import { supabase } from "@/integrations/supabase/client";
import { authService, cartService } from "@/lib/supabase";
import { toast } from "sonner";
import { ShoppingCart, Sparkles } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { RoomType } from "@/lib/roomData";

const Customize = () => {
  const navigate = useNavigate();
  // useFlags is used to get the flags from the LaunchDarkly SDK
  const flags = useFlags();
  const [user, setUser] = useState<User | null>(null);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userTeam, setUserTeam] = useState<string>("bruins");
  const [allRoomTypes, setAllRoomTypes] = useState<RoomType[]>(roomTypes);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await authService.getSession();
      if (data.session) {
        setUser(data.session.user);
        loadCartCount(data.session.user.id);
        // Migrate guest cart if exists
        await cartService.migrateGuestCartToUser(data.session.user.id);
      } else {
        // Guest user - load from localStorage
        loadCartCount();
      }
      fetchUserLocation();
    };

    loadUser();

    const subscription = authService.onAuthStateChange((session, user) => {
      setUser(user);
      if (user) {
        loadCartCount(user.id);
      } else {
        loadCartCount();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Log flag changes for debugging
  useEffect(() => {
    console.log('buildWithAi flag value:', flags.buildWithAi);
  }, [flags.buildWithAi]);

  const fetchUserLocation = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-location');
      if (!error && data?.team) {
        setUserTeam(data.team);
        updateManCaveRoom(data.team);
      }
    } catch (error) {
      console.error('Failed to fetch location:', error);
      // Default to Bruins if location fetch fails
      updateManCaveRoom('bruins');
    }
  };

  const updateManCaveRoom = (teamId: string) => {
    const team = manCaveTeams[teamId];
    if (!team) return;

    const manCaveRoom: RoomType = {
      id: "man-cave",
      name: "Man Cave",
      styles: [
        {
          id: teamId,
          name: `${team.fullName} Fan Cave`,
          description: `Ultimate ${team.fullName} fan cave with team colors, memorabilia, large screen TV, and premium seating. Perfect for game day!`,
          image: team.image,
          price: 55000,
        },
      ],
    };

    setAllRoomTypes([...roomTypes, manCaveRoom]);
  };

  const loadCartCount = async (userId?: string) => {
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
    const selectedItems = Object.entries(selections).filter(([_, styleId]) => styleId);
    
    if (selectedItems.length === 0) {
      toast.error("Please select at least one room style");
      return;
    }

    setLoading(true);

    try {
      for (const [roomId, styleId] of selectedItems) {
        const room = allRoomTypes.find((r) => r.id === roomId);
        const style = room?.styles.find((s) => s.id === styleId);

        if (room && style) {
          await cartService.addToCart({
            user_id: user?.id || "guest",
            room_type: room.name,
            style: style.name,
            price: style.price,
          }, user?.id);
        }
      }

      toast.success(`Added ${selectedItems.length} item(s) to cart`);
      setSelections({});
      loadCartCount(user?.id);
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
    const room = allRoomTypes.find((r) => r.id === roomId);
    const style = room?.styles.find((s) => s.id === styleId);
    return sum + (style?.price || 0);
  }, 0);

  return (

    <div className="min-h-screen bg-background">
      <Navbar user={user} cartCount={cartCount} />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl font-bold">Build Your Dream Home</h1>
            {/* if the buildWithAi flag is true, show the AI builder button */}
            {flags.buildWithAi && (
              <Button
                onClick={() => navigate("/ai-builder")}
                variant="default"
                size="lg"
                className="gap-2 animate-pulse"
              >
                <Sparkles className="h-5 w-5" />
                Build with AI
                <Badge variant="secondary" className="ml-1">NEW</Badge>
              </Button>
            )}
          </div>
          <p className="text-muted-foreground text-lg">
            Choose styles for each room to create your perfect custom home
          </p>
        </div>

        <Tabs defaultValue={allRoomTypes[0].id} className="w-full">
          <TabsList className="w-full flex flex-wrap justify-center gap-2 h-auto bg-muted/50 p-2 mb-8">
            {allRoomTypes.map((room) => (
              <TabsTrigger
                key={room.id}
                value={room.id}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative"
              >
                {room.name}
                {room.id === "man-cave" && (
                  <Badge 
                    variant="destructive" 
                    className="ml-2 animate-pulse"
                  >
                    NEW
                  </Badge>
                )}
                {selections[room.id] && (
                  <span className="ml-2 h-2 w-2 rounded-full bg-accent" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {allRoomTypes.map((room) => (
            <TabsContent key={room.id} value={room.id} className="mt-6">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-semibold">{room.name} Styles</h2>
                {room.id === "man-cave" && (
                  <Badge variant="outline" className="text-xs">
                    🏒 Personalized for your location!
                  </Badge>
                )}
              </div>
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
