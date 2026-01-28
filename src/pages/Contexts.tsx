import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Settings } from "lucide-react";
import { authService, type User } from "@/lib/supabase";
import { useLDClient, useFlags } from "launchdarkly-react-client-sdk";

const Contexts = () => {
  const navigate = useNavigate();
  const ldClient = useLDClient();
  const flags = useFlags();
  const [user, setUser] = useState<User | null>(null);
  const [selectedContext, setSelectedContext] = useState<string | null>(null);
  const [showDropdowns, setShowDropdowns] = useState({
    anna: false,
    jesse: false,
    farengar: false,
  });
  const [enabledFields, setEnabledFields] = useState({
    anna: {
      userKey: true,
      name: true,
      email: true,
      jobFunction: true,
      orgKey: true,
      organization: true,
      street: true,
      city: true,
    },
    jesse: {
      userKey: true,
      name: true,
      email: true,
      jobFunction: true,
      orgKey: true,
      organization: true,
      street: true,
      city: true,
    },
    farengar: {
      userKey: true,
      name: true,
      email: true,
      jobFunction: true,
      orgKey: true,
      organization: true,
      street: true,
      city: true,
    },
  });
  // Live Example state (separate from Mock Example)
  const [liveShowDropdowns, setLiveShowDropdowns] = useState({
    anna: false,
    jesse: false,
    farengar: false,
    windows: false,
    mac: false,
    mobile: false,
    jsonPayload1: false,
    jsonPayload2: false,
  });
  const [liveEnabledFields, setLiveEnabledFields] = useState({
    anna: {
      jobFunction: true,
      organization: true,
      city: true,
    },
    jesse: {
      jobFunction: true,
      organization: true,
      city: true,
    },
    farengar: {
      jobFunction: true,
      organization: true,
      city: true,
    },
  });
  const [liveSelectedContext, setLiveSelectedContext] = useState<string | null>(null);
  // Access card value from LD — set after identify() completes so UI matches current context
  const [accessCardValue, setAccessCardValue] = useState<string>('basic-access');
  // Device context value for download message (1=Windows, 2=Mac, 3=Mobile)
  const [deviceContext, setDeviceContext] = useState<number | null>(null);
  // JSON payload from p-4-json-payload flag
  const [jsonPayload, setJsonPayload] = useState<{
    ctaText: string;
    enabled: boolean;
    showBanner: boolean;
    variant: string;
  } | null>(null);

  // Context data
  const contextData = {
    anna: {
      city: "Springfield",
      organization: "Global Health Services",
      jobFunction: "doctor",
    },
    jesse: {
      city: "Springfield",
      organization: "Global Health Services",
      jobFunction: "nurse",
    },
    farengar: {
      city: "Whiterun",
      organization: "Dragonsreach (Court of the Jarl of Whiterun)",
      jobFunction: "court wizard",
    },
    windows: {
      device: "windows",
    },
    mac: {
      device: "mac",
    },
    mobile: {
      device: "mobile",
    },
    jsonPayload1: {
      userType: "premium",
    },
    jsonPayload2: {
      userType: "standard",
    },
  };

  // Box conditions
  const boxConditions = [
    // Single-attribute conditions
    { location: "Springfield" },
    { location: "Whiterun" },
    { organization: "Global Health Services" },
    { organization: "Dragonsreach (Court of the Jarl of Whiterun)" },
    { jobFunction: "nurse" },
    { jobFunction: "doctor" },
    { jobFunction: "court wizard" },
    // Two-attribute combinations: Location + Organization
    { location: "Springfield", organization: "Global Health Services" },
    { location: "Springfield", organization: "Dragonsreach (Court of the Jarl of Whiterun)" },
    { location: "Whiterun", organization: "Global Health Services" },
    { location: "Whiterun", organization: "Dragonsreach (Court of the Jarl of Whiterun)" },
    // Two-attribute combinations: Location + Job Function
    { location: "Springfield", jobFunction: "nurse" },
    { location: "Springfield", jobFunction: "doctor" },
    { location: "Springfield", jobFunction: "court wizard" },
    { location: "Whiterun", jobFunction: "nurse" },
    { location: "Whiterun", jobFunction: "doctor" },
    { location: "Whiterun", jobFunction: "court wizard" },
    // Two-attribute combinations: Organization + Job Function
    { organization: "Global Health Services", jobFunction: "nurse" },
    { organization: "Global Health Services", jobFunction: "doctor" },
    { organization: "Global Health Services", jobFunction: "court wizard" },
    { organization: "Dragonsreach (Court of the Jarl of Whiterun)", jobFunction: "nurse" },
    { organization: "Dragonsreach (Court of the Jarl of Whiterun)", jobFunction: "doctor" },
    { organization: "Dragonsreach (Court of the Jarl of Whiterun)", jobFunction: "court wizard" },
    // Three-attribute combinations: Springfield + Global Health Services
    { location: "Springfield", organization: "Global Health Services", jobFunction: "nurse" },
    { location: "Springfield", organization: "Global Health Services", jobFunction: "doctor" },
    { location: "Springfield", organization: "Global Health Services", jobFunction: "court wizard" },
    // Three-attribute combinations: Springfield + Dragonsreach
    { location: "Springfield", organization: "Dragonsreach (Court of the Jarl of Whiterun)", jobFunction: "nurse" },
    { location: "Springfield", organization: "Dragonsreach (Court of the Jarl of Whiterun)", jobFunction: "doctor" },
    { location: "Springfield", organization: "Dragonsreach (Court of the Jarl of Whiterun)", jobFunction: "court wizard" },
    // Three-attribute combinations: Whiterun + Global Health Services
    { location: "Whiterun", organization: "Global Health Services", jobFunction: "nurse" },
    { location: "Whiterun", organization: "Global Health Services", jobFunction: "doctor" },
    { location: "Whiterun", organization: "Global Health Services", jobFunction: "court wizard" },
    // Three-attribute combinations: Whiterun + Dragonsreach
    { location: "Whiterun", organization: "Dragonsreach (Court of the Jarl of Whiterun)", jobFunction: "nurse" },
    { location: "Whiterun", organization: "Dragonsreach (Court of the Jarl of Whiterun)", jobFunction: "doctor" },
    { location: "Whiterun", organization: "Dragonsreach (Court of the Jarl of Whiterun)", jobFunction: "court wizard" },
  ];

  // Function to format condition text for tooltip
  const formatConditionText = (condition: Record<string, string>) => {
    const parts: string[] = [];
    if (condition.location) parts.push(`Location: ${condition.location}`);
    if (condition.organization) parts.push(`Organization: ${condition.organization}`);
    if (condition.jobFunction) parts.push(`Job Function: ${condition.jobFunction}`);
    return parts.join(" + ");
  };

  // Function to check if a box should be green
  const isBoxGreen = (boxIndex: number) => {
    if (!selectedContext) return false;
    
    const context = contextData[selectedContext as keyof typeof contextData];
    // Skip device contexts and JSON payload contexts for this function (they don't have city/organization/jobFunction)
    if ('device' in context || 'userType' in context) return false;
    
    const enabled = enabledFields[selectedContext as keyof typeof enabledFields];
    const condition = boxConditions[boxIndex];

    // Check if required fields are enabled
    if (condition.location && !enabled.city) return false;
    if (condition.organization && !enabled.organization) return false;
    if (condition.jobFunction && !enabled.jobFunction) return false;

    // Check if values match
    if (condition.location && context.city !== condition.location) return false;
    if (condition.organization && context.organization !== condition.organization) return false;
    if (condition.jobFunction && context.jobFunction !== condition.jobFunction) return false;

    return true;
  };

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

  // Update LaunchDarkly context when a persona is selected in Live Example
  useEffect(() => {
    if (!ldClient) return;

    // If no persona is selected, revert to original user context
    if (!liveSelectedContext) {
      if (user) {
        const originalContext = {
          kind: 'user',
          key: user.email || user.id,
          email: user.email,
          name: user.email?.split('@')[0],
          anonymous: false,
          premium: true,
        };
        console.log("🔄 [Context Debug] Reverting LaunchDarkly context to original user");
        ldClient.identify(originalContext).then(() => {
          setDeviceContext(null);
          setJsonPayload(null);
          const detail = ldClient.variationDetail('multi-context-homepage-access-card', 'basic-access');
          const value = typeof detail.value === 'string' ? detail.value : String(detail.value ?? 'basic-access');
          setAccessCardValue(value);
        });
      } else {
        setAccessCardValue('basic-access');
        setDeviceContext(null);
        setJsonPayload(null);
      }
      return;
    }

    const personaData = contextData[liveSelectedContext as keyof typeof contextData];
    if (!personaData) return;

    // Build multi-context based on selected persona
    let multiContext: any = {
      kind: "multi",
    };

    // Handle JSON payload contexts (jsonPayload1, jsonPayload2)
    if (liveSelectedContext === "jsonPayload1" || liveSelectedContext === "jsonPayload2") {
      const userType = liveSelectedContext === "jsonPayload1" ? "premium" : "standard";
      
      multiContext.user = {
        key: `user-${liveSelectedContext}`,
        name: `${userType.charAt(0).toUpperCase() + userType.slice(1)} User`,
        email: `user@${userType}.com`,
        userType: userType,
      };
      
      console.log("🔄 [Context Debug] Updating LaunchDarkly context for JSON payload");
      console.log("👤 [Context Debug] Selected User:", liveSelectedContext, "User Type:", userType);
      console.log("📋 [Context Debug] Full Context:", JSON.stringify(multiContext, null, 2));
      
      ldClient.identify(multiContext).then(() => {
        // Clear device context for JSON payload contexts
        setDeviceContext(null);
        
        // Get JSON payload from LaunchDarkly flag evaluation
        try {
          const jsonPayloadDetail = ldClient.variationDetail('p-4-json-payload', null);
          if (jsonPayloadDetail.value && typeof jsonPayloadDetail.value === 'object') {
            const payload = jsonPayloadDetail.value as {
              ctaText?: string;
              enabled?: boolean;
              showBanner?: boolean;
              variant?: string;
            };
            setJsonPayload({
              ctaText: payload.ctaText || '',
              enabled: payload.enabled ?? false,
              showBanner: payload.showBanner ?? false,
              variant: payload.variant || '',
            });
            console.log("🚩 [Flag Debug] JSON payload from LaunchDarkly:", payload);
          } else {
            setJsonPayload(null);
            console.log("⚠️ [JSON Payload Debug] LaunchDarkly returned invalid JSON payload:", jsonPayloadDetail.value);
          }
        } catch (e) {
          setJsonPayload(null);
          console.log("⚠️ [JSON Payload Debug] p-4-json-payload flag evaluation failed:", e);
        }
        
        const detail = ldClient.variationDetail('multi-context-homepage-access-card', 'basic-access');
        const value = typeof detail.value === 'string' ? detail.value : String(detail.value ?? 'basic-access');
        setAccessCardValue(value);
        console.log("🚩 [Flag Debug] After identify — access card:", value);
      });
      return;
    }

    // Handle device contexts (Windows, Mac, Mobile)
    // LaunchDarkly flag p-3-device-routing returns: 1=Windows, 2=Mac, 3=Mobile
    if (liveSelectedContext === "windows" || liveSelectedContext === "mac" || liveSelectedContext === "mobile") {
      const deviceName = liveSelectedContext === "windows" ? "Windows" : liveSelectedContext === "mac" ? "Mac" : "Mobile";
      const osName = liveSelectedContext; // "windows", "mac", or "mobile" (lowercase)
      
      multiContext.user = {
        key: `user-${liveSelectedContext}`,
        name: `${deviceName} User`,
        email: `user@${liveSelectedContext}.com`,
      };
      multiContext.device = {
        key: `device-${liveSelectedContext}`,
        name: osName, // lowercase: "windows", "mac", or "mobile"
        os: osName, // lowercase: "windows", "mac", or "mobile"
      };
      
      console.log("🔄 [Context Debug] Updating LaunchDarkly context with device");
      console.log("👤 [Context Debug] Selected Device:", liveSelectedContext);
      console.log("📋 [Context Debug] Full Context:", JSON.stringify(multiContext, null, 2));
      
      ldClient.identify(multiContext).then(() => {
        // Wait a bit for LaunchDarkly to fully evaluate flags after context change
        setTimeout(() => {
          // Get device context value from LaunchDarkly flag evaluation (returns 1, 2, or 3)
          // 1=Windows, 2=Mac, 3=Mobile
          try {
            const deviceFlagDetail = ldClient.variationDetail('p-3-device-routing', null);
            console.log("🚩 [Device Debug] Full p-3-device-routing flag detail:", deviceFlagDetail);
            console.log("🚩 [Device Debug] Flag value:", deviceFlagDetail.value, "Type:", typeof deviceFlagDetail.value);
            
            // Handle both number and object with value property
            let deviceValue: number | null = null;
            if (typeof deviceFlagDetail.value === 'number') {
              deviceValue = deviceFlagDetail.value;
            } else if (typeof deviceFlagDetail.value === 'object' && deviceFlagDetail.value !== null && 'value' in deviceFlagDetail.value) {
              deviceValue = typeof (deviceFlagDetail.value as any).value === 'number' ? (deviceFlagDetail.value as any).value : null;
            }
            
            if (deviceValue !== null && (deviceValue === 1 || deviceValue === 2 || deviceValue === 3)) {
              setDeviceContext(deviceValue);
              console.log("✅ [Device Debug] Device context set to:", deviceValue);
            } else {
              // If LaunchDarkly doesn't return 1, 2, or 3, clear device context
              setDeviceContext(null);
              console.log("⚠️ [Device Debug] LaunchDarkly returned invalid device value:", deviceFlagDetail.value, "Extracted:", deviceValue);
            }
          } catch (e) {
            // If flag doesn't exist or evaluation fails, clear device context
            setDeviceContext(null);
            console.log("⚠️ [Device Debug] p-3-device-routing flag evaluation failed:", e);
          }
          
          const detail = ldClient.variationDetail('multi-context-homepage-access-card', 'basic-access');
          const value = typeof detail.value === 'string' ? detail.value : String(detail.value ?? 'basic-access');
          setAccessCardValue(value);
          console.log("🚩 [Flag Debug] After identify — access card:", value);
        }, 300); // Wait 300ms for LaunchDarkly to evaluate flags
      });
      return;
    }

    // User context (only for anna, jesse, farengar - device contexts handled above)
    // Clear device context and JSON payload immediately when user/org context is selected
    setDeviceContext(null);
    setJsonPayload(null);
    
    const userOrgData = personaData as { city: string; organization: string; jobFunction: string };
    if (liveSelectedContext === "anna") {
      multiContext.user = {
        key: "user-key-123abc",
        name: "Anna",
        email: "anna@globalhealth.com",
        jobFunction: userOrgData.jobFunction,
      };
      multiContext.organization = {
        key: "org-key-123abc",
        name: userOrgData.organization,
        address: {
          street: "123 Main Street",
          city: userOrgData.city,
        },
      };
    } else if (liveSelectedContext === "jesse") {
      multiContext.user = {
        key: "user-key-456def",
        name: "Jesse",
        email: "jesse@globalhealth.com",
        jobFunction: userOrgData.jobFunction,
      };
      multiContext.organization = {
        key: "org-key-123abc",
        name: userOrgData.organization,
        address: {
          street: "123 Main Street",
          city: userOrgData.city,
        },
      };
    } else if (liveSelectedContext === "farengar") {
      multiContext.user = {
        key: "farengar-secret-fire",
        name: "Farengar Secret-Fire",
        email: "farengar@dragonsreach.com",
        jobFunction: userOrgData.jobFunction,
      };
      multiContext.organization = {
        key: "whiterun-hold",
        name: userOrgData.organization,
        address: {
          street: "1 Cloud District Way",
          city: userOrgData.city,
        },
      };
    }

    // Update LaunchDarkly context with detailed logging
    console.log("🔄 [Context Debug] Updating LaunchDarkly context");
    console.log("👤 [Context Debug] Selected Persona:", liveSelectedContext);
    console.log("📋 [Context Debug] Full Context:", JSON.stringify(multiContext, null, 2));
    console.log("📊 [Context Debug] Context Attributes:", {
      jobFunction: userOrgData.jobFunction,
      organization: userOrgData.organization,
      city: userOrgData.city,
    });
    
      ldClient.identify(multiContext).then(() => {
        // Clear device context and JSON payload for user/org contexts
        setDeviceContext(null);
        setJsonPayload(null);
        
        // Verify LaunchDarkly doesn't return device context
        try {
          const deviceFlagDetail = ldClient.variationDetail('p-3-device-routing', null);
          if (typeof deviceFlagDetail.value === 'number' && (deviceFlagDetail.value === 1 || deviceFlagDetail.value === 2 || deviceFlagDetail.value === 3)) {
            // If LaunchDarkly still returns device context, clear it
            setDeviceContext(null);
            console.log("⚠️ [Device Debug] LaunchDarkly returned device context for user/org context, clearing it");
          }
        } catch (e) {
          // Flag might not exist, which is fine
        }
        
        const detail = ldClient.variationDetail('multi-context-homepage-access-card', 'basic-access');
        const value = typeof detail.value === 'string' ? detail.value : String(detail.value ?? 'basic-access');
        setAccessCardValue(value);
        console.log("🚩 [Flag Debug] After identify — access card:", value, detail);
      });
  }, [ldClient, liveSelectedContext, user]);

  // Sync access card from LD when client is ready (initial load only)
  // Don't sync on flag changes to avoid overriding values set by identify()
  useEffect(() => {
    if (!ldClient) return;
    const detail = ldClient.variationDetail('multi-context-homepage-access-card', 'basic-access');
    const value = typeof detail.value === 'string' ? detail.value : String(detail.value ?? 'basic-access');
    setAccessCardValue(value);
  }, [ldClient]); // Only run when ldClient becomes available, not on flag changes

  // Sync device context from LaunchDarkly flag evaluation (1=Windows, 2=Mac, 3=Mobile)
  // Only set deviceContext if LaunchDarkly returns exactly 1, 2, or 3
  // Don't sync on flag changes to avoid overriding values set by identify()
  // Only sync on initial load, and immediately clear if user/org context is selected
  useEffect(() => {
    if (!ldClient) return;
    
    // Immediately clear device context if user/org context is selected
    if (liveSelectedContext === "anna" || liveSelectedContext === "jesse" || liveSelectedContext === "farengar" || 
        liveSelectedContext === "jsonPayload1" || liveSelectedContext === "jsonPayload2" || !liveSelectedContext) {
      setDeviceContext(null);
      return;
    }
    
    // Don't sync if a device user is currently selected (let identify() handle it)
    if (liveSelectedContext === "windows" || liveSelectedContext === "mac" || liveSelectedContext === "mobile") {
      return;
    }
    
    try {
      const deviceFlagDetail = ldClient.variationDetail('p-3-device-routing', null);
      // Only set deviceContext if LaunchDarkly returns exactly 1, 2, or 3
      if (typeof deviceFlagDetail.value === 'number' && (deviceFlagDetail.value === 1 || deviceFlagDetail.value === 2 || deviceFlagDetail.value === 3)) {
        setDeviceContext(deviceFlagDetail.value);
        setJsonPayload(null); // Clear JSON payload when device context is set
        console.log("🔄 [Device Sync] Device context updated from LaunchDarkly:", deviceFlagDetail.value);
      } else {
        setDeviceContext(null);
      }
    } catch (e) {
      // Flag might not exist or evaluation failed - clear device context
      setDeviceContext(null);
    }
  }, [ldClient, liveSelectedContext]); // Include liveSelectedContext to check context type

  // Sync JSON payload from LaunchDarkly flag evaluation
  // Don't sync on flag changes to avoid overriding values set by identify()
  useEffect(() => {
    if (!ldClient) return;
    try {
      const jsonPayloadDetail = ldClient.variationDetail('p-4-json-payload', null);
      if (jsonPayloadDetail.value && typeof jsonPayloadDetail.value === 'object') {
        const payload = jsonPayloadDetail.value as {
          ctaText?: string;
          enabled?: boolean;
          showBanner?: boolean;
          variant?: string;
        };
        setJsonPayload({
          ctaText: payload.ctaText || '',
          enabled: payload.enabled ?? false,
          showBanner: payload.showBanner ?? false,
          variant: payload.variant || '',
        });
        setDeviceContext(null); // Clear device context when JSON payload is set
        console.log("🔄 [JSON Payload Sync] JSON payload updated from LaunchDarkly:", payload);
      } else {
        // Clear JSON payload if LaunchDarkly returns invalid value
        setJsonPayload(null);
      }
    } catch (e) {
      // Flag might not exist or evaluation failed - clear JSON payload
      setJsonPayload(null);
    }
  }, [ldClient]); // Only run when ldClient becomes available, not on flag changes

  // Log all flags when they change
  useEffect(() => {
    console.log("🚩 [All Flags Debug] ========================================");
    console.log("🚩 [All Flags Debug] All Current Flag Values:");
    Object.keys(flags).forEach((flagKey) => {
      const flagValue = flags[flagKey];
      if (ldClient) {
        try {
          // Try to get detailed information for each flag
          const flagDetail = ldClient.variationDetail(flagKey, null);
          console.log(`🚩 [All Flags Debug]   ${flagKey}:`, {
            value: flagValue,
            detail: {
              variationIndex: flagDetail.variationIndex,
              reason: flagDetail.reason,
            },
          });
        } catch (e) {
          // If variationDetail fails, just log the value
          console.log(`🚩 [All Flags Debug]   ${flagKey}:`, flagValue);
        }
      } else {
        console.log(`🚩 [All Flags Debug]   ${flagKey}:`, flagValue);
      }
    });
    console.log("🚩 [All Flags Debug] ========================================");
  }, [flags, ldClient]);

  // Log initial flag values when component mounts and ldClient is ready
  useEffect(() => {
    if (!ldClient) return;
    
    console.log("🚩 [Initial Flags] ========================================");
    console.log("🚩 [Initial Flags] LaunchDarkly Client Ready - Initial Flag Values:");
    console.log("🚩 [Initial Flags] All Flags:", flags);
    
    // Get detailed info for the main flag we care about
    const mainFlagDetail = ldClient.variationDetail('multi-context-homepage-access-card', 'basic-access');
    console.log("🚩 [Initial Flags] Main Flag 'multi-context-homepage-access-card':", {
      value: flags['multi-context-homepage-access-card'],
      detail: mainFlagDetail,
    });
    console.log("🚩 [Initial Flags] ========================================");
  }, [ldClient]); // Only run when ldClient becomes available

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-2 mb-8">
          <Settings className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Contexts</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Context Preferences</CardTitle>
            <CardDescription>
              Manage and customize context settings for the application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
            In LaunchDarkly, contexts represent the entities (like users, devices, or organizations) that encounter your feature flags, and multi-contexts let you group multiple such contexts into one evaluation so your flags can consider data from more than one entity at once. This is crucial because it allows you to target and control feature behavior based on attributes from multiple related entities simultaneously (for example, serving different variations depending on both a user's role and their organization) rather than just a single context kind. Using multi-contexts reduces risk and increases accuracy in flag evaluations for complex real-world scenarios where decisions depend on multiple dimensions of context.
            </p>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Multi-Context Examples</CardTitle>
            <CardDescription>
              Examples of multi-context configurations for different users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Anna's Context */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Anna</h3>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">Name:</span>
                    <span>Anna</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">Email:</span>
                    <span className="text-right">anna@globalhealth.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">Job Function:</span>
                    <span>doctor</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">Organization:</span>
                    <span className="text-right">Global Health Services</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">Address:</span>
                    <span className="text-right">123 Main Street, Springfield</span>
                  </div>
                </div>
                <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto">
                  <code>{JSON.stringify({
                    "kind": "multi",
                    "user": {
                      "key": "user-key-123abc",
                      "name": "Anna",
                      "email": "anna@globalhealth.com",
                      "jobFunction": "doctor"
                    },
                    "organization": {
                      "key": "org-key-123abc",
                      "name": "Global Health Services",
                      "address": {
                        "street": "123 Main Street",
                        "city": "Springfield"
                      }
                    }
                  }, null, 2)}</code>
                </pre>
              </div>

              {/* Jesse's Context */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Jesse</h3>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">Name:</span>
                    <span>Jesse</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">Email:</span>
                    <span className="text-right">jesse@globalhealth.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">Job Function:</span>
                    <span>nurse</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">Organization:</span>
                    <span className="text-right">Global Health Services</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">Address:</span>
                    <span className="text-right">123 Main Street, Springfield</span>
                  </div>
                </div>
                <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto">
                  <code>{JSON.stringify({
                    "kind": "multi",
                    "user": {
                      "key": "user-key-456def",
                      "name": "Jesse",
                      "email": "jesse@globalhealth.com",
                      "jobFunction": "nurse"
                    },
                    "organization": {
                      "key": "org-key-123abc",
                      "name": "Global Health Services",
                      "address": {
                        "street": "123 Main Street",
                        "city": "Springfield"
                      }
                    }
                  }, null, 2)}</code>
                </pre>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-muted-foreground">
                The "kind" field is crucial in LaunchDarkly contexts as it defines the type of entity being evaluated. 
                For single contexts, "kind" identifies whether the context represents a "user", "device", "organization", or other entity type. 
                In multi-contexts, setting "kind" to "multi" signals to LaunchDarkly that this context contains multiple nested contexts, 
                each with their own kind. This allows feature flags to evaluate rules and targeting conditions across multiple dimensions 
                simultaneously—for example, targeting based on both a user's role (from the "user" context) and their organization's 
                subscription tier (from the "organization" context). Without the correct "kind" specification, LaunchDarkly cannot 
                properly identify and evaluate the context attributes, making it impossible to apply the appropriate feature flag rules 
                and targeting logic.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Mock Example</CardTitle>
            <CardDescription>
              Select a context to see how multi-contexts work in action
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {/* Anna */}
              <div
                className={`p-4 rounded-lg border-2 transition-colors ${
                  selectedContext === "anna"
                    ? "bg-green-50 border-green-500 dark:bg-green-950 dark:border-green-600"
                    : "bg-card border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Anna</h3>
                  <Button
                    size="sm"
                    variant={selectedContext === "anna" ? "default" : "outline"}
                    onClick={() => setSelectedContext(selectedContext === "anna" ? null : "anna")}
                  >
                    {selectedContext === "anna" ? "Selected" : "Select"}
                  </Button>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="anna-dropdown" className="text-sm">
                    Show Details
                  </Label>
                  <Switch
                    id="anna-dropdown"
                    checked={showDropdowns.anna}
                    onCheckedChange={(checked) =>
                      setShowDropdowns({ ...showDropdowns, anna: checked })
                    }
                  />
                </div>
                <Collapsible open={showDropdowns.anna}>
                  <CollapsibleContent className="mt-2 space-y-2 text-sm">
                    <div className="bg-muted p-3 rounded-md space-y-0">
                      <div className="space-y-1 pb-2 border-b">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-muted-foreground">User Key:</span>
                          <Switch
                            checked={enabledFields.anna.userKey}
                            onCheckedChange={(checked) =>
                              setEnabledFields({
                                ...enabledFields,
                                anna: { ...enabledFields.anna, userKey: checked },
                              })
                            }
                          />
                        </div>
                        <div className="pl-4">• user-key-123abc</div>
                      </div>
                      <div className="space-y-1 py-2 border-b">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-muted-foreground">Name:</span>
                          <Switch
                            checked={enabledFields.anna.name}
                            onCheckedChange={(checked) =>
                              setEnabledFields({
                                ...enabledFields,
                                anna: { ...enabledFields.anna, name: checked },
                              })
                            }
                          />
                        </div>
                        <div className="pl-4">• Anna</div>
                      </div>
                      <div className="space-y-1 py-2 border-b">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-muted-foreground">Email:</span>
                          <Switch
                            checked={enabledFields.anna.email}
                            onCheckedChange={(checked) =>
                              setEnabledFields({
                                ...enabledFields,
                                anna: { ...enabledFields.anna, email: checked },
                              })
                            }
                          />
                        </div>
                        <div className="pl-4 text-xs">• anna@globalhealth.com</div>
                      </div>
                      <div className="space-y-1 py-2 border-b">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-muted-foreground">Job Function:</span>
                          <Switch
                            checked={enabledFields.anna.jobFunction}
                            onCheckedChange={(checked) =>
                              setEnabledFields({
                                ...enabledFields,
                                anna: { ...enabledFields.anna, jobFunction: checked },
                              })
                            }
                          />
                        </div>
                        <div className="pl-4">• doctor</div>
                      </div>
                      <Separator className="my-2" />
                      <div className="space-y-1 py-2 border-b">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-muted-foreground">Org Key:</span>
                          <Switch
                            checked={enabledFields.anna.orgKey}
                            onCheckedChange={(checked) =>
                              setEnabledFields({
                                ...enabledFields,
                                anna: { ...enabledFields.anna, orgKey: checked },
                              })
                            }
                          />
                        </div>
                        <div className="pl-4">• org-key-123abc</div>
                      </div>
                      <div className="space-y-1 py-2 border-b">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-muted-foreground">Organization:</span>
                          <Switch
                            checked={enabledFields.anna.organization}
                            onCheckedChange={(checked) =>
                              setEnabledFields({
                                ...enabledFields,
                                anna: { ...enabledFields.anna, organization: checked },
                              })
                            }
                          />
                        </div>
                        <div className="pl-4 text-xs">• Global Health Services</div>
                      </div>
                      <div className="space-y-1 py-2 border-b">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-muted-foreground">Street:</span>
                          <Switch
                            checked={enabledFields.anna.street}
                            onCheckedChange={(checked) =>
                              setEnabledFields({
                                ...enabledFields,
                                anna: { ...enabledFields.anna, street: checked },
                              })
                            }
                          />
                        </div>
                        <div className="pl-4">• 123 Main Street</div>
                      </div>
                      <div className="space-y-1 py-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-muted-foreground">City:</span>
                          <Switch
                            checked={enabledFields.anna.city}
                            onCheckedChange={(checked) =>
                              setEnabledFields({
                                ...enabledFields,
                                anna: { ...enabledFields.anna, city: checked },
                              })
                            }
                          />
                        </div>
                        <div className="pl-4">• Springfield</div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>

              {/* Jesse */}
              <div
                className={`p-4 rounded-lg border-2 transition-colors ${
                  selectedContext === "jesse"
                    ? "bg-green-50 border-green-500 dark:bg-green-950 dark:border-green-600"
                    : "bg-card border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Jesse</h3>
                  <Button
                    size="sm"
                    variant={selectedContext === "jesse" ? "default" : "outline"}
                    onClick={() => setSelectedContext(selectedContext === "jesse" ? null : "jesse")}
                  >
                    {selectedContext === "jesse" ? "Selected" : "Select"}
                  </Button>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="jesse-dropdown" className="text-sm">
                    Show Details
                  </Label>
                  <Switch
                    id="jesse-dropdown"
                    checked={showDropdowns.jesse}
                    onCheckedChange={(checked) =>
                      setShowDropdowns({ ...showDropdowns, jesse: checked })
                    }
                  />
                </div>
                <Collapsible open={showDropdowns.jesse}>
                  <CollapsibleContent className="mt-2 space-y-2 text-sm">
                    <div className="bg-muted p-3 rounded-md space-y-0">
                      <div className="space-y-1 pb-2 border-b">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-muted-foreground">User Key:</span>
                          <Switch
                            checked={enabledFields.jesse.userKey}
                            onCheckedChange={(checked) =>
                              setEnabledFields({
                                ...enabledFields,
                                jesse: { ...enabledFields.jesse, userKey: checked },
                              })
                            }
                          />
                        </div>
                        <div className="pl-4">• user-key-456def</div>
                      </div>
                      <div className="space-y-1 py-2 border-b">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-muted-foreground">Name:</span>
                          <Switch
                            checked={enabledFields.jesse.name}
                            onCheckedChange={(checked) =>
                              setEnabledFields({
                                ...enabledFields,
                                jesse: { ...enabledFields.jesse, name: checked },
                              })
                            }
                          />
                        </div>
                        <div className="pl-4">• Jesse</div>
                      </div>
                      <div className="space-y-1 py-2 border-b">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-muted-foreground">Email:</span>
                          <Switch
                            checked={enabledFields.jesse.email}
                            onCheckedChange={(checked) =>
                              setEnabledFields({
                                ...enabledFields,
                                jesse: { ...enabledFields.jesse, email: checked },
                              })
                            }
                          />
                        </div>
                        <div className="pl-4 text-xs">• jesse@globalhealth.com</div>
                      </div>
                      <div className="space-y-1 py-2 border-b">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-muted-foreground">Job Function:</span>
                          <Switch
                            checked={enabledFields.jesse.jobFunction}
                            onCheckedChange={(checked) =>
                              setEnabledFields({
                                ...enabledFields,
                                jesse: { ...enabledFields.jesse, jobFunction: checked },
                              })
                            }
                          />
                        </div>
                        <div className="pl-4">• nurse</div>
                      </div>
                      <Separator className="my-2" />
                      <div className="space-y-1 py-2 border-b">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-muted-foreground">Org Key:</span>
                          <Switch
                            checked={enabledFields.jesse.orgKey}
                            onCheckedChange={(checked) =>
                              setEnabledFields({
                                ...enabledFields,
                                jesse: { ...enabledFields.jesse, orgKey: checked },
                              })
                            }
                          />
                        </div>
                        <div className="pl-4">• org-key-123abc</div>
                      </div>
                      <div className="space-y-1 py-2 border-b">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-muted-foreground">Organization:</span>
                          <Switch
                            checked={enabledFields.jesse.organization}
                            onCheckedChange={(checked) =>
                              setEnabledFields({
                                ...enabledFields,
                                jesse: { ...enabledFields.jesse, organization: checked },
                              })
                            }
                          />
                        </div>
                        <div className="pl-4 text-xs">• Global Health Services</div>
                      </div>
                      <div className="space-y-1 py-2 border-b">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-muted-foreground">Street:</span>
                          <Switch
                            checked={enabledFields.jesse.street}
                            onCheckedChange={(checked) =>
                              setEnabledFields({
                                ...enabledFields,
                                jesse: { ...enabledFields.jesse, street: checked },
                              })
                            }
                          />
                        </div>
                        <div className="pl-4">• 123 Main Street</div>
                      </div>
                      <div className="space-y-1 py-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-muted-foreground">City:</span>
                          <Switch
                            checked={enabledFields.jesse.city}
                            onCheckedChange={(checked) =>
                              setEnabledFields({
                                ...enabledFields,
                                jesse: { ...enabledFields.jesse, city: checked },
                              })
                            }
                          />
                        </div>
                        <div className="pl-4">• Springfield</div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>

              {/* Farengar */}
              <div
                className={`p-4 rounded-lg border-2 transition-colors ${
                  selectedContext === "farengar"
                    ? "bg-green-50 border-green-500 dark:bg-green-950 dark:border-green-600"
                    : "bg-card border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Farengar</h3>
                  <Button
                    size="sm"
                    variant={selectedContext === "farengar" ? "default" : "outline"}
                    onClick={() => setSelectedContext(selectedContext === "farengar" ? null : "farengar")}
                  >
                    {selectedContext === "farengar" ? "Selected" : "Select"}
                  </Button>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="farengar-dropdown" className="text-sm">
                    Show Details
                  </Label>
                  <Switch
                    id="farengar-dropdown"
                    checked={showDropdowns.farengar}
                    onCheckedChange={(checked) =>
                      setShowDropdowns({ ...showDropdowns, farengar: checked })
                    }
                  />
                </div>
                <Collapsible open={showDropdowns.farengar}>
                  <CollapsibleContent className="mt-2 space-y-2 text-sm">
                    <div className="bg-muted p-3 rounded-md space-y-0">
                      <div className="space-y-1 pb-2 border-b">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-muted-foreground">User Key:</span>
                          <Switch
                            checked={enabledFields.farengar.userKey}
                            onCheckedChange={(checked) =>
                              setEnabledFields({
                                ...enabledFields,
                                farengar: { ...enabledFields.farengar, userKey: checked },
                              })
                            }
                          />
                        </div>
                        <div className="pl-4">• farengar-secret-fire</div>
                      </div>
                      <div className="space-y-1 py-2 border-b">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-muted-foreground">Name:</span>
                          <Switch
                            checked={enabledFields.farengar.name}
                            onCheckedChange={(checked) =>
                              setEnabledFields({
                                ...enabledFields,
                                farengar: { ...enabledFields.farengar, name: checked },
                              })
                            }
                          />
                        </div>
                        <div className="pl-4">• Farengar Secret-Fire</div>
                      </div>
                      <div className="space-y-1 py-2 border-b">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-muted-foreground">Email:</span>
                          <Switch
                            checked={enabledFields.farengar.email}
                            onCheckedChange={(checked) =>
                              setEnabledFields({
                                ...enabledFields,
                                farengar: { ...enabledFields.farengar, email: checked },
                              })
                            }
                          />
                        </div>
                        <div className="pl-4 text-xs">• farengar@dragonsreach.com</div>
                      </div>
                      <div className="space-y-1 py-2 border-b">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-muted-foreground">Job Function:</span>
                          <Switch
                            checked={enabledFields.farengar.jobFunction}
                            onCheckedChange={(checked) =>
                              setEnabledFields({
                                ...enabledFields,
                                farengar: { ...enabledFields.farengar, jobFunction: checked },
                              })
                            }
                          />
                        </div>
                        <div className="pl-4">• court wizard</div>
                      </div>
                      <Separator className="my-2" />
                      <div className="space-y-1 py-2 border-b">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-muted-foreground">Org Key:</span>
                          <Switch
                            checked={enabledFields.farengar.orgKey}
                            onCheckedChange={(checked) =>
                              setEnabledFields({
                                ...enabledFields,
                                farengar: { ...enabledFields.farengar, orgKey: checked },
                              })
                            }
                          />
                        </div>
                        <div className="pl-4">• whiterun-hold</div>
                      </div>
                      <div className="space-y-1 py-2 border-b">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-muted-foreground">Organization:</span>
                          <Switch
                            checked={enabledFields.farengar.organization}
                            onCheckedChange={(checked) =>
                              setEnabledFields({
                                ...enabledFields,
                                farengar: { ...enabledFields.farengar, organization: checked },
                              })
                            }
                          />
                        </div>
                        <div className="pl-4 text-xs">• Dragonsreach (Court of the Jarl of Whiterun)</div>
                      </div>
                      <div className="space-y-1 py-2 border-b">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-muted-foreground">Street:</span>
                          <Switch
                            checked={enabledFields.farengar.street}
                            onCheckedChange={(checked) =>
                              setEnabledFields({
                                ...enabledFields,
                                farengar: { ...enabledFields.farengar, street: checked },
                              })
                            }
                          />
                        </div>
                        <div className="pl-4">• 1 Cloud District Way</div>
                      </div>
                      <div className="space-y-1 py-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-muted-foreground">City:</span>
                          <Switch
                            checked={enabledFields.farengar.city}
                            onCheckedChange={(checked) =>
                              setEnabledFields({
                                ...enabledFields,
                                farengar: { ...enabledFields.farengar, city: checked },
                              })
                            }
                          />
                        </div>
                        <div className="pl-4">• Whiterun</div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Feature Flag Matrix</CardTitle>
            <CardDescription>
              Feature flags based on selected context and enabled fields. As you can see below, with just three context attributes, there are 27 possible combinations. This is why it's important to use multi-contexts to group multiple related entities into one evaluation so your flags can consider data from more than one entity at once.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TooltipProvider>
              <div className="grid grid-cols-6 gap-2">
                {boxConditions.map((condition, index) => {
                  const isGreen = isBoxGreen(index);
                  const conditionText = formatConditionText(condition);
                  
                  return (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <div
                          className={`aspect-square flex items-center justify-center rounded-md border transition-colors cursor-pointer ${
                            isGreen
                              ? "bg-green-100 border-green-500 dark:bg-green-900 dark:border-green-600"
                              : "bg-muted border-border"
                          }`}
                        >
                          <span className="font-semibold text-xs">F{index + 1}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm max-w-xs">{conditionText}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </TooltipProvider>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Live Example</CardTitle>
            <CardDescription>
              Select a context to see how multi-contexts work in action
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {/* Anna */}
              <div
                className={`p-4 rounded-lg border-2 transition-colors ${
                  liveSelectedContext === "anna"
                    ? "bg-green-50 border-green-500 dark:bg-green-950 dark:border-green-600"
                    : "bg-card border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Anna</h3>
                  <Button
                    size="sm"
                    variant={liveSelectedContext === "anna" ? "default" : "outline"}
                    onClick={() => setLiveSelectedContext(liveSelectedContext === "anna" ? null : "anna")}
                  >
                    {liveSelectedContext === "anna" ? "Selected" : "Select"}
                  </Button>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="live-anna-dropdown" className="text-sm">
                    Show Details
                  </Label>
                  <Switch
                    id="live-anna-dropdown"
                    checked={liveShowDropdowns.anna}
                    onCheckedChange={(checked) =>
                      setLiveShowDropdowns({ ...liveShowDropdowns, anna: checked })
                    }
                  />
                </div>
                <Collapsible open={liveShowDropdowns.anna}>
                  <CollapsibleContent className="mt-2 space-y-2 text-sm">
                    <div className="bg-muted p-3 rounded-md space-y-0">
                      <div className="space-y-1 py-2 border-b">
                        <div className="font-medium text-muted-foreground">Job Function:</div>
                        <div className="pl-4">• doctor</div>
                      </div>
                      <div className="space-y-1 py-2 border-b">
                        <div className="font-medium text-muted-foreground">Organization:</div>
                        <div className="pl-4 text-xs">• Global Health Services</div>
                      </div>
                      <div className="space-y-1 py-2">
                        <div className="font-medium text-muted-foreground">City:</div>
                        <div className="pl-4">• Springfield</div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>

              {/* Jesse */}
              <div
                className={`p-4 rounded-lg border-2 transition-colors ${
                  liveSelectedContext === "jesse"
                    ? "bg-green-50 border-green-500 dark:bg-green-950 dark:border-green-600"
                    : "bg-card border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Jesse</h3>
                  <Button
                    size="sm"
                    variant={liveSelectedContext === "jesse" ? "default" : "outline"}
                    onClick={() => setLiveSelectedContext(liveSelectedContext === "jesse" ? null : "jesse")}
                  >
                    {liveSelectedContext === "jesse" ? "Selected" : "Select"}
                  </Button>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="live-jesse-dropdown" className="text-sm">
                    Show Details
                  </Label>
                  <Switch
                    id="live-jesse-dropdown"
                    checked={liveShowDropdowns.jesse}
                    onCheckedChange={(checked) =>
                      setLiveShowDropdowns({ ...liveShowDropdowns, jesse: checked })
                    }
                  />
                </div>
                <Collapsible open={liveShowDropdowns.jesse}>
                  <CollapsibleContent className="mt-2 space-y-2 text-sm">
                    <div className="bg-muted p-3 rounded-md space-y-0">
                      <div className="space-y-1 py-2 border-b">
                        <div className="font-medium text-muted-foreground">Job Function:</div>
                        <div className="pl-4">• nurse</div>
                      </div>
                      <div className="space-y-1 py-2 border-b">
                        <div className="font-medium text-muted-foreground">Organization:</div>
                        <div className="pl-4 text-xs">• Global Health Services</div>
                      </div>
                      <div className="space-y-1 py-2">
                        <div className="font-medium text-muted-foreground">City:</div>
                        <div className="pl-4">• Springfield</div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>

              {/* Farengar */}
              <div
                className={`p-4 rounded-lg border-2 transition-colors ${
                  liveSelectedContext === "farengar"
                    ? "bg-green-50 border-green-500 dark:bg-green-950 dark:border-green-600"
                    : "bg-card border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Farengar</h3>
                  <Button
                    size="sm"
                    variant={liveSelectedContext === "farengar" ? "default" : "outline"}
                    onClick={() => setLiveSelectedContext(liveSelectedContext === "farengar" ? null : "farengar")}
                  >
                    {liveSelectedContext === "farengar" ? "Selected" : "Select"}
                  </Button>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="live-farengar-dropdown" className="text-sm">
                    Show Details
                  </Label>
                  <Switch
                    id="live-farengar-dropdown"
                    checked={liveShowDropdowns.farengar}
                    onCheckedChange={(checked) =>
                      setLiveShowDropdowns({ ...liveShowDropdowns, farengar: checked })
                    }
                  />
                </div>
                <Collapsible open={liveShowDropdowns.farengar}>
                  <CollapsibleContent className="mt-2 space-y-2 text-sm">
                    <div className="bg-muted p-3 rounded-md space-y-0">
                      <div className="space-y-1 py-2 border-b">
                        <div className="font-medium text-muted-foreground">Job Function:</div>
                        <div className="pl-4">• court wizard</div>
                      </div>
                      <div className="space-y-1 py-2 border-b">
                        <div className="font-medium text-muted-foreground">Organization:</div>
                        <div className="pl-4 text-xs">• Dragonsreach (Court of the Jarl of Whiterun)</div>
                      </div>
                      <div className="space-y-1 py-2">
                        <div className="font-medium text-muted-foreground">City:</div>
                        <div className="pl-4">• Whiterun</div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>

              {/* Windows User */}
              <div
                className={`p-4 rounded-lg border-2 transition-colors ${
                  liveSelectedContext === "windows"
                    ? "bg-green-50 border-green-500 dark:bg-green-950 dark:border-green-600"
                    : "bg-card border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Windows</h3>
                  <Button
                    size="sm"
                    variant={liveSelectedContext === "windows" ? "default" : "outline"}
                    onClick={() => setLiveSelectedContext(liveSelectedContext === "windows" ? null : "windows")}
                  >
                    {liveSelectedContext === "windows" ? "Selected" : "Select"}
                  </Button>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="live-windows-dropdown" className="text-sm">
                    Show Details
                  </Label>
                  <Switch
                    id="live-windows-dropdown"
                    checked={liveShowDropdowns.windows}
                    onCheckedChange={(checked) =>
                      setLiveShowDropdowns({ ...liveShowDropdowns, windows: checked })
                    }
                  />
                </div>
                <Collapsible open={liveShowDropdowns.windows}>
                  <CollapsibleContent className="mt-2 space-y-2 text-sm">
                    <div className="bg-muted p-3 rounded-md space-y-0">
                      <div className="space-y-1 py-2 border-b">
                        <div className="font-medium text-muted-foreground">Device:</div>
                        <div className="pl-4">• Windows</div>
                      </div>
                    </div>
                    <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto mt-2">
                      <code>{JSON.stringify({
                        "device": {
                          "key": "device-windows",
                          "name": "windows",
                          "os": "windows"
                        }
                      }, null, 2)}</code>
                    </pre>
                  </CollapsibleContent>
                </Collapsible>
              </div>

              {/* Mac User */}
              <div
                className={`p-4 rounded-lg border-2 transition-colors ${
                  liveSelectedContext === "mac"
                    ? "bg-green-50 border-green-500 dark:bg-green-950 dark:border-green-600"
                    : "bg-card border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Mac</h3>
                  <Button
                    size="sm"
                    variant={liveSelectedContext === "mac" ? "default" : "outline"}
                    onClick={() => setLiveSelectedContext(liveSelectedContext === "mac" ? null : "mac")}
                  >
                    {liveSelectedContext === "mac" ? "Selected" : "Select"}
                  </Button>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="live-mac-dropdown" className="text-sm">
                    Show Details
                  </Label>
                  <Switch
                    id="live-mac-dropdown"
                    checked={liveShowDropdowns.mac}
                    onCheckedChange={(checked) =>
                      setLiveShowDropdowns({ ...liveShowDropdowns, mac: checked })
                    }
                  />
                </div>
                <Collapsible open={liveShowDropdowns.mac}>
                  <CollapsibleContent className="mt-2 space-y-2 text-sm">
                    <div className="bg-muted p-3 rounded-md space-y-0">
                      <div className="space-y-1 py-2 border-b">
                        <div className="font-medium text-muted-foreground">Device:</div>
                        <div className="pl-4">• Mac</div>
                      </div>
                    </div>
                    <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto mt-2">
                      <code>{JSON.stringify({
                        "device": {
                          "key": "device-mac",
                          "name": "mac",
                          "os": "mac"
                        }
                      }, null, 2)}</code>
                    </pre>
                  </CollapsibleContent>
                </Collapsible>
              </div>

              {/* Mobile User */}
              <div
                className={`p-4 rounded-lg border-2 transition-colors ${
                  liveSelectedContext === "mobile"
                    ? "bg-green-50 border-green-500 dark:bg-green-950 dark:border-green-600"
                    : "bg-card border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Mobile</h3>
                  <Button
                    size="sm"
                    variant={liveSelectedContext === "mobile" ? "default" : "outline"}
                    onClick={() => setLiveSelectedContext(liveSelectedContext === "mobile" ? null : "mobile")}
                  >
                    {liveSelectedContext === "mobile" ? "Selected" : "Select"}
                  </Button>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="live-mobile-dropdown" className="text-sm">
                    Show Details
                  </Label>
                  <Switch
                    id="live-mobile-dropdown"
                    checked={liveShowDropdowns.mobile}
                    onCheckedChange={(checked) =>
                      setLiveShowDropdowns({ ...liveShowDropdowns, mobile: checked })
                    }
                  />
                </div>
                <Collapsible open={liveShowDropdowns.mobile}>
                  <CollapsibleContent className="mt-2 space-y-2 text-sm">
                    <div className="bg-muted p-3 rounded-md space-y-0">
                      <div className="space-y-1 py-2 border-b">
                        <div className="font-medium text-muted-foreground">Device:</div>
                        <div className="pl-4">• Mobile</div>
                      </div>
                    </div>
                    <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto mt-2">
                      <code>{JSON.stringify({
                        "device": {
                          "key": "device-mobile",
                          "name": "mobile",
                          "os": "mobile"
                        }
                      }, null, 2)}</code>
                    </pre>
                  </CollapsibleContent>
                </Collapsible>
              </div>

              {/* JSON Payload User 1 */}
              <div
                className={`p-4 rounded-lg border-2 transition-colors ${
                  liveSelectedContext === "jsonPayload1"
                    ? "bg-green-50 border-green-500 dark:bg-green-950 dark:border-green-600"
                    : "bg-card border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Premium User</h3>
                  <Button
                    size="sm"
                    variant={liveSelectedContext === "jsonPayload1" ? "default" : "outline"}
                    onClick={() => setLiveSelectedContext(liveSelectedContext === "jsonPayload1" ? null : "jsonPayload1")}
                  >
                    {liveSelectedContext === "jsonPayload1" ? "Selected" : "Select"}
                  </Button>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="live-jsonPayload1-dropdown" className="text-sm">
                    Show Details
                  </Label>
                  <Switch
                    id="live-jsonPayload1-dropdown"
                    checked={liveShowDropdowns.jsonPayload1}
                    onCheckedChange={(checked) =>
                      setLiveShowDropdowns({ ...liveShowDropdowns, jsonPayload1: checked })
                    }
                  />
                </div>
                <Collapsible open={liveShowDropdowns.jsonPayload1}>
                  <CollapsibleContent className="mt-2 space-y-2 text-sm">
                    <div className="bg-muted p-3 rounded-md space-y-0">
                      <div className="space-y-1 py-2 border-b">
                        <div className="font-medium text-muted-foreground">User Type:</div>
                        <div className="pl-4">• Premium</div>
                      </div>
                    </div>
                    {jsonPayload && liveSelectedContext === "jsonPayload1" && (
                      <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto mt-2">
                        <code>{JSON.stringify(jsonPayload, null, 2)}</code>
                      </pre>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </div>

              {/* JSON Payload User 2 */}
              <div
                className={`p-4 rounded-lg border-2 transition-colors ${
                  liveSelectedContext === "jsonPayload2"
                    ? "bg-green-50 border-green-500 dark:bg-green-950 dark:border-green-600"
                    : "bg-card border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Standard User</h3>
                  <Button
                    size="sm"
                    variant={liveSelectedContext === "jsonPayload2" ? "default" : "outline"}
                    onClick={() => setLiveSelectedContext(liveSelectedContext === "jsonPayload2" ? null : "jsonPayload2")}
                  >
                    {liveSelectedContext === "jsonPayload2" ? "Selected" : "Select"}
                  </Button>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="live-jsonPayload2-dropdown" className="text-sm">
                    Show Details
                  </Label>
                  <Switch
                    id="live-jsonPayload2-dropdown"
                    checked={liveShowDropdowns.jsonPayload2}
                    onCheckedChange={(checked) =>
                      setLiveShowDropdowns({ ...liveShowDropdowns, jsonPayload2: checked })
                    }
                  />
                </div>
                <Collapsible open={liveShowDropdowns.jsonPayload2}>
                  <CollapsibleContent className="mt-2 space-y-2 text-sm">
                    <div className="bg-muted p-3 rounded-md space-y-0">
                      <div className="space-y-1 py-2 border-b">
                        <div className="font-medium text-muted-foreground">User Type:</div>
                        <div className="pl-4">• Standard</div>
                      </div>
                    </div>
                    {jsonPayload && liveSelectedContext === "jsonPayload2" && (
                      <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto mt-2">
                        <code>{JSON.stringify(jsonPayload, null, 2)}</code>
                      </pre>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Welcome Card - Shows download message for device contexts, JSON payload content, or access card for user contexts */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            {(deviceContext === 1 || deviceContext === 2 || deviceContext === 3) ? (
              /* Download Message - Shows only when LaunchDarkly returns 1, 2, or 3 (1=Windows, 2=Mac, 3=Mobile) */
              (() => {
                const deviceName = deviceContext === 1 ? "Windows" : deviceContext === 2 ? "Mac" : "Mobile";
                const deviceIcon = deviceContext === 1 ? "🪟" : deviceContext === 2 ? "🍎" : "📱";
                return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{deviceIcon}</div>
                      <div>
                        <h2 className="text-2xl font-bold">Download Available</h2>
                        <div className="mt-2 text-sm text-muted-foreground">
                          Device: {deviceName} (Value: {deviceContext})
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">
                        Download for {deviceName}
                      </h3>
                      <p className="text-muted-foreground">
                        Get the best experience optimized for your {deviceName} device.
                      </p>
                      <Button className="w-full sm:w-auto">
                        Download for {deviceName}
                      </Button>
                    </div>
                  </div>
                );
              })()
            ) : jsonPayload ? (
              /* JSON Payload Card - Shows content based on p-4-json-payload flag values */
              <div className="space-y-4">
                {jsonPayload.showBanner && (
                  <div className={`p-4 rounded-lg border-2 ${
                    jsonPayload.variant === 'new-experience' 
                      ? 'bg-blue-50 border-blue-500 dark:bg-blue-950 dark:border-blue-600' 
                      : 'bg-muted border-border'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {jsonPayload.variant === 'new-experience' ? '✨' : '📋'}
                      </span>
                      <div>
                        <h3 className="font-semibold">
                          {jsonPayload.variant === 'new-experience' ? 'New Experience Available' : 'Dashboard Access'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {jsonPayload.variant === 'new-experience' 
                            ? 'Try our enhanced dashboard with new features' 
                            : 'Access your dashboard'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <div className="text-4xl">
                    {jsonPayload.variant === 'new-experience' ? '🚀' : '📊'}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {jsonPayload.variant === 'new-experience' ? 'New Dashboard Experience' : 'Dashboard'}
                    </h2>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <div>Variant: {jsonPayload.variant}</div>
                      <div>Status: {jsonPayload.enabled ? 'Enabled' : 'Disabled'}</div>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">
                    {jsonPayload.variant === 'new-experience' ? '✨ Enhanced Features' : '📊 Standard Dashboard'}
                  </h3>
                  <p className="text-muted-foreground">
                    {jsonPayload.variant === 'new-experience'
                      ? 'Experience our new dashboard with improved analytics, better visualization, and enhanced user experience.'
                      : 'Access your standard dashboard with all your essential tools and features.'}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button 
                      className="w-full sm:w-auto"
                      disabled={!jsonPayload.enabled}
                      variant={jsonPayload.variant === 'new-experience' ? 'default' : 'outline'}
                    >
                      {jsonPayload.ctaText || 'Go to Dashboard'}
                    </Button>
                    {!jsonPayload.enabled && (
                      <span className="text-sm text-muted-foreground">(Currently disabled)</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Access Card - Shows based on LaunchDarkly feature flag */
              <>
            {accessCardValue === 'care-team-overview' && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">🧑‍⚕️</div>
                        <div>
                          <h2 className="text-2xl font-bold">Anna</h2>
                          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                            <div>Job Function: doctor</div>
                            <div>Organization: Global Health Services</div>
                            <div>City: Springfield</div>
                          </div>
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold">🧾 Care Team Overview</h3>
                        <p className="text-muted-foreground">
                          You can view your assigned patients' summaries and care plans for your Springfield facility at Global Health Services.
                        </p>
                        <Button className="w-full sm:w-auto">
                          View Care Plans
                        </Button>
                      </div>
                    </div>
                  )}
            {accessCardValue === 'regional-clinical-access' && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">🧑‍⚕️</div>
                        <div>
                          <h2 className="text-2xl font-bold">Jesse</h2>
                          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                            <div>Job Function: nurse</div>
                            <div>Organization: Global Health Services</div>
                            <div>City: Springfield</div>
                          </div>
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold">🩺 Regional Clinical Access Enabled</h3>
                        <p className="text-muted-foreground">
                          You have access to all advanced patient analytics and clinical decision support tools for Global Health Services in Springfield.
                        </p>
                        <Button className="w-full sm:w-auto">
                          View Patient Dashboard
                        </Button>
                      </div>
                    </div>
                  )}
            {accessCardValue === 'arcane-research' && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">🧙</div>
                        <div>
                          <h2 className="text-2xl font-bold">Farengar</h2>
                          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                            <div>Job Function: court wizard</div>
                            <div>Organization: Dragonsreach (Court of the Jarl of Whiterun)</div>
                            <div>City: Whiterun</div>
                          </div>
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold">🔥 Arcane Research Authorized</h3>
                        <p className="text-muted-foreground">
                          You have been granted access to experimental spell research and dragon-related findings within Dragonsreach.
                        </p>
                        <div className="rounded-lg overflow-hidden border">
                          <img
                            src="/48e7d0d3-aa9c-4041-8c5d-128843ae89ff.png"
                            alt="Arcane research workspace with magical symbols and mystical artifacts"
                            className="w-full h-auto"
                          />
                        </div>
                        <Button className="w-full sm:w-auto">
                          Review Arcane Tomes
                        </Button>
                      </div>
                    </div>
                  )}
            {((accessCardValue === 'basic-access') ||
              (accessCardValue !== 'care-team-overview' && accessCardValue !== 'regional-clinical-access' && accessCardValue !== 'arcane-research')) && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">👤</div>
                        <div>
                          <h2 className="text-2xl font-bold">{user?.email?.split('@')[0] || 'User'}</h2>
                          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                            <div>Basic Access</div>
                            <div className="text-xs text-muted-foreground/70">
                              Flag value: {accessCardValue}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold">Welcome</h3>
                        <p className="text-muted-foreground">
                          You have basic access to the application. Select a persona above to see different access levels based on context attributes.
                        </p>
                      </div>
                    </div>
                  )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contexts;
