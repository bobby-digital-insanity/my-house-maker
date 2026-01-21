import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import heroImage from "@/assets/hero-home.jpg";
import { authService, cartService } from "@/lib/supabase";
import { Home, Palette, ShoppingCart, CheckCircle } from "lucide-react";
import type { User } from "@supabase/supabase-js";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await authService.getSession();
      if (data.session) {
        setUser(data.session.user);
        loadCartCount(data.session.user.id);
      }
    };

    loadUser();

    const subscription = authService.onAuthStateChange((session, user) => {
      setUser(user);
      if (user) loadCartCount(user.id);
      else setCartCount(0);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadCartCount = async (userId: string) => {
    const { data } = await cartService.getCartItems(userId);
    setCartCount(data?.length || 0);
  };

  const features = [
    {
      icon: <Home className="h-8 w-8" />,
      title: "Premium Designs",
      description: "Choose from carefully curated architectural styles for every room",
    },
    {
      icon: <Palette className="h-8 w-8" />,
      title: "Full Customization",
      description: "Mix and match styles to create your unique dream home",
    },
    {
      icon: <ShoppingCart className="h-8 w-8" />,
      title: "Simple Process",
      description: "Easy selection and checkout process from start to finish",
    },
    {
      icon: <CheckCircle className="h-8 w-8" />,
      title: "Our Modern Approach to Technology",
      description: "We use LaunchDarkly with CI/CD and SDLC best practices to ensure the highest quality of code and deployment.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} cartCount={cartCount} />
      
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Luxury custom home"
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-transparent" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-primary-foreground">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              Build Your Dream Home
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Customize every room with premium styles. From rustic to modern, create the perfect home that matches your vision.
            </p>
            <div className="flex flex-wrap gap-4">
              {user ? (
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => navigate("/customize")}
                  className="text-lg"
                >
                  Start Building
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => navigate("/Customize")}
                  className="text-lg"
                >
                  Get Started
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose DreamHome Builder?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience a seamless journey from inspiration to your perfect custom home design
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-accent mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Building?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of homeowners who have created their dream spaces with our intuitive customization platform
          </p>
          {user ? (
            <Button
              size="lg"
              onClick={() => navigate("/customize")}
              className="text-lg"
            >
              Start Customizing Now
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="text-lg"
            >
              Create Your Account
            </Button>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
