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

const Contexts = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [selectedContext, setSelectedContext] = useState<string | null>(null);
  const [showDropdowns, setShowDropdowns] = useState({
    anna: false,
    jesse: false,
    rob: false,
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
    rob: {
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
    rob: false,
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
    rob: {
      jobFunction: true,
      organization: true,
      city: true,
    },
  });
  const [liveSelectedContext, setLiveSelectedContext] = useState<string | null>(null);

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
    rob: {
      city: "Whiterun",
      organization: "Dragonsreach (Court of the Jarl of Whiterun)",
      jobFunction: "court wizard",
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

              {/* Rob */}
              <div
                className={`p-4 rounded-lg border-2 transition-colors ${
                  selectedContext === "rob"
                    ? "bg-green-50 border-green-500 dark:bg-green-950 dark:border-green-600"
                    : "bg-card border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Farengar</h3>
                  <Button
                    size="sm"
                    variant={selectedContext === "rob" ? "default" : "outline"}
                    onClick={() => setSelectedContext(selectedContext === "rob" ? null : "rob")}
                  >
                    {selectedContext === "rob" ? "Selected" : "Select"}
                  </Button>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="rob-dropdown" className="text-sm">
                    Show Details
                  </Label>
                  <Switch
                    id="rob-dropdown"
                    checked={showDropdowns.rob}
                    onCheckedChange={(checked) =>
                      setShowDropdowns({ ...showDropdowns, rob: checked })
                    }
                  />
                </div>
                <Collapsible open={showDropdowns.rob}>
                  <CollapsibleContent className="mt-2 space-y-2 text-sm">
                    <div className="bg-muted p-3 rounded-md space-y-0">
                      <div className="space-y-1 pb-2 border-b">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-muted-foreground">User Key:</span>
                          <Switch
                            checked={enabledFields.rob.userKey}
                            onCheckedChange={(checked) =>
                              setEnabledFields({
                                ...enabledFields,
                                rob: { ...enabledFields.rob, userKey: checked },
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
                            checked={enabledFields.rob.name}
                            onCheckedChange={(checked) =>
                              setEnabledFields({
                                ...enabledFields,
                                rob: { ...enabledFields.rob, name: checked },
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
                            checked={enabledFields.rob.email}
                            onCheckedChange={(checked) =>
                              setEnabledFields({
                                ...enabledFields,
                                rob: { ...enabledFields.rob, email: checked },
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
                            checked={enabledFields.rob.jobFunction}
                            onCheckedChange={(checked) =>
                              setEnabledFields({
                                ...enabledFields,
                                rob: { ...enabledFields.rob, jobFunction: checked },
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
                            checked={enabledFields.rob.orgKey}
                            onCheckedChange={(checked) =>
                              setEnabledFields({
                                ...enabledFields,
                                rob: { ...enabledFields.rob, orgKey: checked },
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
                            checked={enabledFields.rob.organization}
                            onCheckedChange={(checked) =>
                              setEnabledFields({
                                ...enabledFields,
                                rob: { ...enabledFields.rob, organization: checked },
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
                            checked={enabledFields.rob.street}
                            onCheckedChange={(checked) =>
                              setEnabledFields({
                                ...enabledFields,
                                rob: { ...enabledFields.rob, street: checked },
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
                            checked={enabledFields.rob.city}
                            onCheckedChange={(checked) =>
                              setEnabledFields({
                                ...enabledFields,
                                rob: { ...enabledFields.rob, city: checked },
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
                  liveSelectedContext === "rob"
                    ? "bg-green-50 border-green-500 dark:bg-green-950 dark:border-green-600"
                    : "bg-card border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Farengar</h3>
                  <Button
                    size="sm"
                    variant={liveSelectedContext === "rob" ? "default" : "outline"}
                    onClick={() => setLiveSelectedContext(liveSelectedContext === "rob" ? null : "rob")}
                  >
                    {liveSelectedContext === "rob" ? "Selected" : "Select"}
                  </Button>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="live-rob-dropdown" className="text-sm">
                    Show Details
                  </Label>
                  <Switch
                    id="live-rob-dropdown"
                    checked={liveShowDropdowns.rob}
                    onCheckedChange={(checked) =>
                      setLiveShowDropdowns({ ...liveShowDropdowns, rob: checked })
                    }
                  />
                </div>
                <Collapsible open={liveShowDropdowns.rob}>
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
            </div>
          </CardContent>
        </Card>

        {/* Welcome Card */}
        {liveSelectedContext && (
          <Card className="mt-6">
            <CardContent className="pt-6">
              {liveSelectedContext === "anna" && (
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
                    <h3 className="text-xl font-semibold">🩺 Clinical Insights Enabled</h3>
                    <p className="text-muted-foreground">
                      You have access to all advanced patient analytics and clinical decision support tools for Global Health Services in Springfield.
                    </p>
                    <Button className="w-full sm:w-auto">
                      View Patient Dashboard
                    </Button>
                  </div>
                </div>
              )}
              
              {liveSelectedContext === "jesse" && (
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
              
              {liveSelectedContext === "rob" && (
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
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Contexts;
