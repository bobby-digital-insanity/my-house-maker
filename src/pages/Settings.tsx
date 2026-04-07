import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLDClient, useFlags } from "launchdarkly-react-client-sdk";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Settings, MessageCircle, ArrowRight, Activity, Square } from "lucide-react";
import { authService, type User } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  startSyntheticTraffic,
  stopSyntheticTraffic,
  isSyntheticTrafficActive,
} from "@/lib/trafficSimulator";

const TRAFFIC_DURATION_MS = 20 * 60 * 1000;

function formatRemaining(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

const SettingsPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [trafficRunning, setTrafficRunning] = useState(() => isSyntheticTrafficActive());
  const [trafficRemainingMs, setTrafficRemainingMs] = useState(0);
  
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

  useEffect(() => {
    return () => {
      stopSyntheticTraffic();
    };
  }, []);

  const handleStartTraffic = () => {
    if (isSyntheticTrafficActive()) {
      toast.message("Synthetic traffic is already running.");
      return;
    }
    startSyntheticTraffic(TRAFFIC_DURATION_MS, {
      onStart: () => {
        setTrafficRunning(true);
        setTrafficRemainingMs(TRAFFIC_DURATION_MS);
        toast.success("Synthetic traffic started — runs for 20 minutes.");
      },
      onStop: () => {
        setTrafficRunning(false);
        setTrafficRemainingMs(0);
        toast.message("Synthetic traffic stopped.");
      },
      onTick: (remainingMs) => {
        setTrafficRemainingMs(remainingMs);
      },
    });
  };

  const handleStopTraffic = () => {
    stopSyntheticTraffic();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-2 mb-8">
          <Settings className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Settings</h1>
        </div>

        <div className="space-y-6">

          {/* Context Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Context Preferences</CardTitle>
              <CardDescription>
                Customize the context of the application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="context-preferences">Context Preferences</Label>
                  <p className="text-sm text-muted-foreground">
                    Manage and customize context settings for the application
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate("/contexts")}
                  className="flex items-center gap-2"
                >
                  Open Contexts
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Metrics</CardTitle>
              <CardDescription>
                View and analyze application metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="metrics">Metrics</Label>
                  <p className="text-sm text-muted-foreground">
                    View detailed metrics and analytics for the application
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate("/metrics")}
                  className="flex items-center gap-2"
                >
                  Open Metrics
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Traces */}
          <Card>
            <CardHeader>
              <CardTitle>Distributed Traces</CardTitle>
              <CardDescription>
                Generate and view distributed traces with LaunchDarkly Observability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="traces">Traces</Label>
                  <p className="text-sm text-muted-foreground">
                    Generate distributed traces showcasing API calls and database operations
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate("/traces")}
                  className="flex items-center gap-2"
                >
                  Open Traces
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Synthetic traffic (demo / load generation) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Synthetic traffic
              </CardTitle>
              <CardDescription>
                Drive automated checkouts and trace requests for demos and observability. Runs for{" "}
                <span className="font-medium text-foreground">20 minutes</span> after you start.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Checkouts hit <code className="rounded bg-muted px-1">/log-checkout</code> with
                random cart totals several times per minute. Authenticated{" "}
                <code className="rounded bg-muted px-1">/api/traces/generate</code> calls mix fast,
                slow, and intentionally failing traces with linked logs and error records in
                LaunchDarkly when you are signed in.
              </p>
              {trafficRunning && (
                <p className="text-sm font-medium text-foreground">
                  Time remaining: {formatRemaining(trafficRemainingMs)}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={handleStartTraffic}
                  disabled={trafficRunning}
                  className="gap-2"
                >
                  <Activity className="h-4 w-4" />
                  Generate traffic
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleStopTraffic}
                  disabled={!trafficRunning}
                  className="gap-2"
                >
                  <Square className="h-4 w-4" />
                  Stop traffic
                </Button>
              </div>
            </CardContent>
          </Card>
          
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
