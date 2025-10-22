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

const queryClient = new QueryClient();

const App = () => (
  <LDProvider 
    clientSideID={import.meta.env.VITE_LAUNCHDARKLY_CLIENT_SIDE_ID}
    context={{
      kind: 'user',
      key: 'anonymous-user',
      anonymous: true
    }}
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

export default App;
