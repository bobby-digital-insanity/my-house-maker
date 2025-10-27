import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
// add in LaunchDarkly SDK
// LDProvider is used to provide the LaunchDarkly client context to the app
import { LDProvider } from 'launchdarkly-react-client-sdk';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Customize from "./pages/Customize";
import AIBuilder from "./pages/AIBuilder";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import { authService } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const queryClient = new QueryClient();

// Wrapper component that manages LaunchDarkly context based on auth state
const AppWithLD = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get initial session
    authService.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    // Listen for auth state changes
    const subscription = authService.onAuthStateChange((session, user) => {
      setUser(user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Create LaunchDarkly context based on whether user is logged in
  const ldContext = user
    ? {
        kind: 'user',
        key: user.email || user.id,
        email: user.email,
        name: user.email?.split('@')[0], // Use email prefix as name
        anonymous: false,
      }
    : {
        kind: 'user',
        key: 'anonymous-user',
        anonymous: true,
      };

  return (
    <LDProvider 
      clientSideID={import.meta.env.VITE_LAUNCHDARKLY_CLIENT_SIDE_ID}
      context={ldContext}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/customize" element={<Customize />} />
              <Route path="/ai-builder" element={<AIBuilder />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </LDProvider>
  );
};

const App = () => <AppWithLD />;

export default App;
