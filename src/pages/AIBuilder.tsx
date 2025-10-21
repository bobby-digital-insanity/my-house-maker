import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { authService, cartService } from "@/lib/supabase";
import { toast } from "sonner";
import { Sparkles, Loader2, ShoppingCart } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface Recommendation {
  roomType: string;
  styleName: string;
  reason: string;
  price: number;
}

const AIBuilder = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [vibe, setVibe] = useState("");
  const [model, setModel] = useState("google/gemini-2.5-flash");
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await authService.getSession();
      if (data.session) {
        setUser(data.session.user);
        loadCartCount(data.session.user.id);
      } else {
        // Guest user
        loadCartCount();
      }
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
  }, []);

  const loadCartCount = async (userId?: string) => {
    const { data } = await cartService.getCartItems(userId);
    setCartCount(data?.length || 0);
  };

  const handleGenerate = async () => {
    if (!vibe.trim()) {
      toast.error("Please describe your ideal home vibe");
      return;
    }

    setLoading(true);
    setRecommendations([]);

    try {
      const { data, error } = await supabase.functions.invoke('ai-home-recommendations', {
        body: { vibe, model }
      });

      if (error) throw error;

      if (data?.recommendations) {
        setRecommendations(data.recommendations);
        toast.success("AI recommendations generated!");
      } else {
        toast.error("Failed to generate recommendations");
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast.error("Failed to generate recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (recommendation: Recommendation) => {
    try {
      await cartService.addToCart({
        user_id: user?.id || "guest",
        room_type: recommendation.roomType,
        style: recommendation.styleName,
        price: recommendation.price,
      }, user?.id);

      toast.success("Added to cart!");
      loadCartCount(user?.id);
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  const handleAddAllToCart = async () => {
    if (recommendations.length === 0) return;

    setLoading(true);
    try {
      for (const rec of recommendations) {
        await cartService.addToCart({
          user_id: user?.id || "guest",
          room_type: rec.roomType,
          style: rec.styleName,
          price: rec.price,
        }, user?.id);
      }

      toast.success(`Added ${recommendations.length} items to cart!`);
      loadCartCount(user?.id);
      navigate("/cart");
    } catch (error) {
      toast.error("Failed to add items to cart");
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = recommendations.reduce((sum, rec) => sum + rec.price, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} cartCount={cartCount} />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            <h1 className="text-4xl font-bold">Build with AI</h1>
            <Badge variant="destructive" className="animate-pulse">NEW</Badge>
          </div>
          <p className="text-muted-foreground text-lg">
            Describe your dream home vibe and let AI recommend the perfect styles
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What's your vibe?</CardTitle>
            <CardDescription>
              Tell us about your ideal home atmosphere, lifestyle, or aesthetic preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="model-select">AI Model</Label>
              <Select value={model} onValueChange={setModel} disabled={loading}>
                <SelectTrigger id="model-select">
                  <SelectValue placeholder="Select AI model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google/gemini-2.5-flash">Gemini 2.5 Flash (Recommended)</SelectItem>
                  <SelectItem value="google/gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                  <SelectItem value="google/gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</SelectItem>
                  <SelectItem value="openai/gpt-5">GPT-5</SelectItem>
                  <SelectItem value="openai/gpt-5-mini">GPT-5 Mini</SelectItem>
                  <SelectItem value="openai/gpt-5-nano">GPT-5 Nano</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder="E.g., 'I want a cozy, rustic mountain retreat with a modern touch' or 'Tech-forward minimalist space perfect for remote work'"
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
              className="min-h-[120px]"
              disabled={loading}
            />
            <Button 
              onClick={handleGenerate} 
              disabled={loading || !vibe.trim()}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generating Recommendations...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate AI Recommendations
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {recommendations.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Your Personalized Recommendations</h2>
              <Button onClick={handleAddAllToCart} disabled={loading} className="gap-2">
                <ShoppingCart className="h-4 w-4" />
                Add All to Cart (${totalPrice.toLocaleString()})
              </Button>
            </div>

            <div className="grid gap-4">
              {recommendations.map((rec, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold">{rec.roomType}</h3>
                          <Badge variant="outline">{rec.styleName}</Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">{rec.reason}</p>
                        <p className="text-lg font-bold text-primary">
                          ${rec.price.toLocaleString()}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleAddToCart(rec)}
                        variant="outline"
                        className="ml-4"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIBuilder;
