import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
// add in LaunchDarkly SDK
// LDProvider is used to provide the LaunchDarkly client context to the app
import { LDProvider, useLDClient, useFlags } from 'launchdarkly-react-client-sdk';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Customize from "./pages/Customize";
import AIBuilder from "./pages/AIBuilder";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { authService } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { MessageCircle } from "lucide-react";

const queryClient = new QueryClient();

// Helper function to create LaunchDarkly context from user
const createLDContext = (user: User | null) => {
  return user
    ? {
        kind: 'user',
        key: user.email || user.id,
        email: user.email,
        name: user.email?.split('@')[0],
        anonymous: false,
        premium: true,
      }
    : {
        kind: 'user',
        key: 'anonymous-user',
        anonymous: true,
        premium: false,
      };
};

// Chat Bubble Component
const ChatBubble = () => {
  const ldClient = useLDClient();
  const flags = useFlags();
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const checkChatVisibility = () => {
      // Check LaunchDarkly flag
      const hasPremiumSupport = ldClient 
        ? ldClient.variation("premium-support", false)
        : false;
      
      // Check localStorage preference
      const savedPreference = localStorage.getItem('showLiveChatSupport') === 'true';
      
      // Show chat if both conditions are met
      setShowChat(hasPremiumSupport && savedPreference);
    };

    // Check immediately
    checkChatVisibility();

    // Listen for storage changes (when settings page updates localStorage)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'showLiveChatSupport') {
        checkChatVisibility();
      }
    };

    // Listen for custom storage event (for same-tab updates)
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event (for same-tab updates from settings page)
    const handleCustomStorageChange = () => {
      checkChatVisibility();
    };
    window.addEventListener('liveChatSupportChanged', handleCustomStorageChange);

    // Poll localStorage periodically as fallback (optional, but ensures it updates)
    const interval = setInterval(checkChatVisibility, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('liveChatSupportChanged', handleCustomStorageChange);
      clearInterval(interval);
    };
  }, [ldClient, flags]);

  if (!showChat) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-shadow hover:scale-110"
        aria-label="Open live chat support"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );
};

// Inner component that re-identifies users when auth state changes
const AppContent = () => {
  const ldClient = useLDClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get initial session
    authService.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    // Listen for auth state changes
    const subscription = authService.onAuthStateChange((session, user) => {
      setUser(user);
      console.log('User:', user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Re-identify user with LaunchDarkly whenever user key changes
  useEffect(() => {
    if (ldClient && user !== undefined) {
      const ldContext = createLDContext(user);
      const currentKey = user?.email || user?.id || 'anonymous-user';
      
      // adding these logs to help showcase the LaunchDarkly context and user object.
      console.log('LaunchDarkly context:', ldContext);
      console.log('User key:', ldContext.key);
      console.log('User name:', ldContext.name ?? '(no name)');
      console.log('User email:', ldContext.email ?? '(no email)');
      console.log('User anonymous:', ldContext.anonymous);
      console.log('User premium:', (ldContext as { premium?: boolean }).premium ?? false);
      console.log('Email contains realtor.com:', user?.email?.includes('realtor.com'));
      console.log('Full Supabase user object:', user);
      
      ldClient.identify(ldContext);
    }
  }, [ldClient, user?.email, user?.id]);

  return (
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
            <Route path="/settings" element={<Settings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ChatBubble />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

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
        // hard code premium users to true for example, this would be pulled from SSO or user database.
        premium: true,
      } 
    : {
        kind: 'user',
        key: 'anonymous-user',
        anonymous: true,
        premium: false,
      };

  return (
    <LDProvider 
      clientSideID={import.meta.env.VITE_LAUNCHDARKLY_CLIENT_SIDE_ID}
      context={ldContext}
      options={{
        diagnosticOptOut: false,
      }}
    >
      <AppContent />
    </LDProvider>
  );
};

const App = () => <AppWithLD />;

export default App;
