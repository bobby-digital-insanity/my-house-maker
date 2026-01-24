import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// add in LaunchDarkly SDK
import { useFlags, useLDClient } from 'launchdarkly-react-client-sdk';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import RoomCard from "@/components/RoomCard";
import Navbar from "@/components/Navbar";
import { roomTypes } from "@/lib/roomData";
import { manCaveTeams } from "@/lib/manCaveData";
import { supabase } from "@/integrations/supabase/client";
import { authService, cartService, type User, type CartItem } from "@/lib/supabase";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import type { RoomType } from "@/lib/roomData";

const Customize = () => {
  const navigate = useNavigate();
  // useFlags is used to get the flags from the LaunchDarkly SDK
  const flags = useFlags();
  // useLDClient is used to track custom events/metrics
  const ldClient = useLDClient();
  const [user, setUser] = useState<User | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userTeam, setUserTeam] = useState<string>("bruins");
  const [allRoomTypes, setAllRoomTypes] = useState<RoomType[]>(roomTypes);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await authService.getSession();
      if (data?.session?.user) {
        setUser(data.session.user);
        await loadCartItems(data.session.user.id);
        // Migrate guest cart if exists
        await cartService.migrateGuestCartToUser(data.session.user.id);
        await loadCartItems(data.session.user.id);
      } else {
        // Guest user - load from localStorage
        await loadCartItems();
      }
      fetchUserLocation();
    };

    loadUser();

    const subscription = authService.onAuthStateChange(async (session, user) => {
      setUser(user);
      if (user) {
        await loadCartItems(user.id);
      } else {
        await loadCartItems();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

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

  const loadCartItems = async (userId?: string) => {
    const { data } = await cartService.getCartItems(userId);
    setCartItems(data || []);
    setCartCount(data?.length || 0);
  };

  const isItemInCart = (roomName: string, styleName: string): boolean => {
    return cartItems.some(
      (item) => item.room_type === roomName && item.style === styleName
    );
  };

  const getCartItemId = (roomName: string, styleName: string): string | undefined => {
    const item = cartItems.find(
      (item) => item.room_type === roomName && item.style === styleName
    );
    return item?.id;
  };

  const handleCartToggle = async (roomId: string, styleId: string) => {
    const room = allRoomTypes.find((r) => r.id === roomId);
    const style = room?.styles.find((s) => s.id === styleId);

    if (!room || !style) return;

    const inCart = isItemInCart(room.name, style.name);

    if (inCart) {
      // Remove from cart
      const itemId = getCartItemId(room.name, style.name);
      if (itemId) {
        setLoading(true);
        try {
          const { error } = await cartService.removeFromCart(itemId, user?.id);
          if (error) {
            toast.error("Failed to remove item from cart");
          } else {
            await loadCartItems(user?.id);
            toast("Item removed from cart");
          }
        } catch (error) {
          toast.error("Failed to remove item from cart");
        } finally {
          setLoading(false);
        }
      }
    } else {
      // Add to cart
      setLoading(true);
      try {
        const { error } = await cartService.addToCart({
          user_id: user?.id || "guest",
          room_type: room.name,
          style: style.name,
          price: style.price,
        }, user?.id);

        if (error) {
          toast.error("Failed to add item to cart");
        } else {
          await loadCartItems(user?.id);
          toast("Item added to cart");
        }
      } catch (error) {
        toast.error("Failed to add item to cart");
      } finally {
        setLoading(false);
      }
    }
  };

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
                onClick={() => {
                  // Track when button is clicked (before navigation)
                  const clickTime = Date.now();
                  
                  // Store click time in sessionStorage for AIBuilder to calculate response time
                  sessionStorage.setItem('aiBuilderStartTime', clickTime.toString());
                  
                  // Track custom event in LaunchDarkly
                  if (ldClient) {
                    ldClient.track('build-with-ai-button-click', {
                      page: 'customize',
                      clickTime: clickTime,
                    });
                    console.log('✅ Event sent to LaunchDarkly: build-with-ai-button-click', {
                      timestamp: new Date(clickTime).toISOString(),
                    });
                  }
                  navigate("/ai-builder");
                }}
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
                    inCart={isItemInCart(room.name, style.name)}
                    onCartToggle={() => handleCartToggle(room.id, style.id)}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

      </div>
    </div>
  );
};

export default Customize;
