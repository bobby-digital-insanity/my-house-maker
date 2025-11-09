import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLDClient, useFlags } from "launchdarkly-react-client-sdk";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, MessageCircle } from "lucide-react";
import { authService } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { useEffect } from "react";

const SettingsPage = () => {
  const [user, setUser] = useState<User | null>(null);
  
  // UI Toggle States (these will be connected to feature flags later)
  const [darkMode, setDarkMode] = useState(false);
  const [compactView, setCompactView] = useState(false);
  const [showAnimations, setShowAnimations] = useState(true);
  const [showRecommendations, setShowRecommendations] = useState(true);
  // Initialize from localStorage immediately to avoid flash
  const [showLiveChatSupport, setShowLiveChatSupport] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('showLiveChatSupport');
      return saved === 'true';
    }
    return false;
  });
  const [enableNotifications, setEnableNotifications] = useState(false);
  const [showPriceEstimates, setShowPriceEstimates] = useState(true);

  //LD implementation
  const ldClient = useLDClient();
  const flags = useFlags();
  

// get users premium support status from LaunchDarkly
const hasPremiumSupport = flags.premiumSupport;
console.log('PremiumSupport', hasPremiumSupport);



  useEffect(() => {
    const loadUser = async () => {
      const { data } = await authService.getSession();
      if (data.session) {
        setUser(data.session.user);
      }
    };
    loadUser();

    const subscription = authService.onAuthStateChange((session, user) => {
      setUser(user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sync to localStorage when toggle changes
  useEffect(() => {
    localStorage.setItem('showLiveChatSupport', showLiveChatSupport.toString());
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('liveChatSupportChanged'));
  }, [showLiveChatSupport]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-2 mb-8">
          <Settings className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Settings</h1>
        </div>

        <div className="space-y-6">
          {/* Display Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Display Preferences</CardTitle>
              <CardDescription>
                Customize how content appears in the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Switch to dark theme
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="compact-view">Compact View</Label>
                  <p className="text-sm text-muted-foreground">
                    Reduce spacing and padding for a more compact layout
                  </p>
                </div>
                <Switch
                  id="compact-view"
                  checked={compactView}
                  onCheckedChange={setCompactView}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-animations">Show Animations</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable transitions and animations throughout the app
                  </p>
                </div>
                <Switch
                  id="show-animations"
                  checked={showAnimations}
                  onCheckedChange={setShowAnimations}
                />
              </div>
              
              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-recommendations">Show AI Recommendations</Label>
                  <p className="text-sm text-muted-foreground">
                    Display AI-generated recommendations on the home page
                  </p>
                </div>
                <Switch
                  id="show-recommendations"
                  checked={showRecommendations}
                  onCheckedChange={setShowRecommendations}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-price-estimates">Show Price Estimates</Label>
                  <p className="text-sm text-muted-foreground">
                    Display estimated prices for room designs
                  </p>
                </div>
                <Switch
                  id="show-price-estimates"
                  checked={showPriceEstimates}
                  onCheckedChange={setShowPriceEstimates}
                />
              </div>
            </CardContent>
          </Card>

          {/* Content Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Premium Preferences</CardTitle>
              <CardDescription>
                Premium support packages and features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                    <Label htmlFor="show-live-chat-support">Show Live Chat Support</Label>
                    {hasPremiumSupport ? (
                        <p className="text-sm text-muted-foreground">
                            Premium support package active.
                        </p>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            This is a premium support package option. Please reach out to your sales representative for enablement.

                        </p>
                    )}
                    </div>
                    <Switch
                    id="show-live-chat-support"
                    checked={hasPremiumSupport && showLiveChatSupport}
                    onCheckedChange={setShowLiveChatSupport}
                    disabled={!hasPremiumSupport}
                    />
                </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Manage notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enable-notifications">Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates about new features and recommendations
                  </p>
                </div>
                <Switch
                  id="enable-notifications"
                  checked={enableNotifications}
                  onCheckedChange={setEnableNotifications}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
    </div>
  );
};

export default SettingsPage;
