import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Activity, ArrowRight, Database, Server, Zap, CheckCircle2, Loader2 } from "lucide-react";
import { authService, type User } from "@/lib/supabase";
import { useLDClient, useFlags } from "launchdarkly-react-client-sdk";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Traces = () => {
  const navigate = useNavigate();
  const ldClient = useLDClient();
  const flags = useFlags();
  const [user, setUser] = useState<User | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [traceResult, setTraceResult] = useState<{
    success: boolean;
    traceId?: string;
    message?: string;
  } | null>(null);

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

  const handleGenerateTrace = async () => {
    setIsGenerating(true);
    setTraceResult(null);

    try {
      // Get auth token
      const { data: sessionData } = await authService.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        setTraceResult({
          success: false,
          message: "Please log in to generate traces. You need to be authenticated with the custom auth system.",
        });
        setIsGenerating(false);
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const url = `${apiUrl}/api/traces/generate`;

      console.log('Calling trace endpoint:', url);
      console.log('Token present:', !!token);

      // Call the trace generation endpoint
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // Get response text first (can only read once)
      const responseText = await response.text();
      
      // Try to parse as JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        // If not JSON, use the text as error message
        throw new Error(`Server returned non-JSON response: ${responseText}`);
      }

      if (response.ok) {
        setTraceResult({
          success: true,
          traceId: result.traceId,
          message: result.message || "Trace generated successfully!",
        });

        // Track event in LaunchDarkly
        if (ldClient) {
          ldClient.track("trace-generated", {
            traceId: result.traceId,
            timestamp: new Date().toISOString(),
          });
        }
      } else {
        console.error('API Error:', result);
        setTraceResult({
          success: false,
          message: result.error || result.message || `Failed to generate trace (${response.status}: ${response.statusText})`,
        });
      }
    } catch (error) {
      console.error("Error generating trace:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setTraceResult({
        success: false,
        message: `Failed to generate trace: ${errorMessage}. Please check the browser console for details.`,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center gap-2 mb-8">
          <Activity className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Distributed Traces</h1>
        </div>

        <div className="space-y-6">
          {/* Introduction Card */}
          <Card>
            <CardHeader>
              <CardTitle>Understanding Distributed Traces</CardTitle>
              <CardDescription>
                LaunchDarkly Observability captures distributed traces that show the complete flow of requests through your application, including API calls and database operations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                When you click "Generate Trace", the system will create a distributed trace with multiple spans that demonstrate:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                <li>HTTP request handling (Express middleware)</li>
                <li>Database queries (PostgreSQL operations)</li>
                <li>Multiple service interactions</li>
                <li>Performance timing for each operation</li>
              </ul>
            </CardContent>
          </Card>

          {/* Visual Diagram */}
          <Card>
            <CardHeader>
              <CardTitle>Trace Flow Diagram</CardTitle>
              <CardDescription>
                Visual representation of what happens when you generate a trace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Trace Flow Visualization */}
                <div className="relative">
                  {/* Root Span - HTTP Request */}
                  <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg border-2 border-primary/20 mb-4">
                    <Server className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <div className="font-semibold">Root Span: HTTP POST /api/traces/generate</div>
                      <div className="text-sm text-muted-foreground">Total Duration: ~150-300ms</div>
                    </div>
                  </div>

                  {/* Child Spans */}
                  <div className="ml-8 space-y-3">
                    {/* Database Query 1 */}
                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <Database className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">Span 1: SELECT users</div>
                        <div className="text-xs text-muted-foreground">Query user data • ~20-50ms</div>
                      </div>
                    </div>

                    {/* Database Query 2 */}
                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <Database className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">Span 2: SELECT cart_items</div>
                        <div className="text-xs text-muted-foreground">Query cart data • ~15-40ms</div>
                      </div>
                    </div>

                    {/* Database Query 3 */}
                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <Database className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">Span 3: INSERT trace_log</div>
                        <div className="text-xs text-muted-foreground">Log trace event • ~10-30ms</div>
                      </div>
                    </div>

                    {/* Processing Span */}
                    <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">Span 4: Process & Aggregate</div>
                        <div className="text-xs text-muted-foreground">Business logic • ~5-15ms</div>
                      </div>
                    </div>
                  </div>

                  {/* Connection Lines */}
                  <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-primary/30"></div>
                </div>

                {/* Legend */}
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <div className="text-sm font-semibold mb-2">Legend:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-primary/20 border border-primary/40 rounded"></div>
                      <span>Root Span (HTTP Request)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 rounded"></div>
                      <span>Database Query Span</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-100 dark:bg-purple-900 border border-purple-300 dark:border-purple-700 rounded"></div>
                      <span>Processing Span</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3" />
                      <span>Span Relationship</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generate Trace Card */}
          <Card>
            <CardHeader>
              <CardTitle>Generate Distributed Trace</CardTitle>
              <CardDescription>
                Click the button below to generate a distributed trace with multiple spans. The trace will be automatically captured by LaunchDarkly Observability and visible in the LaunchDarkly dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!user && (
                <Alert variant="destructive">
                  <Activity className="h-4 w-4" />
                  <AlertTitle>Authentication Required</AlertTitle>
                  <AlertDescription>
                    You need to be logged in with the custom authentication system to generate traces. 
                    Please log in via the Auth page using the custom sign-in (not Supabase).
                  </AlertDescription>
                </Alert>
              )}
              <Button
                onClick={handleGenerateTrace}
                disabled={isGenerating}
                size="lg"
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Trace...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Generate Trace
                  </>
                )}
              </Button>

              {traceResult && (
                <Alert variant={traceResult.success ? "default" : "destructive"}>
                  {traceResult.success ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Activity className="h-4 w-4" />
                  )}
                  <AlertTitle>
                    {traceResult.success ? "Trace Generated Successfully!" : "Trace Generation Failed"}
                  </AlertTitle>
                  <AlertDescription>
                    {traceResult.message}
                    {traceResult.traceId && (
                      <div className="mt-2 text-xs font-mono">
                        Trace ID: {traceResult.traceId}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>What to expect in LaunchDarkly:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
                  <li>Navigate to <strong>Observability → Traces</strong> in LaunchDarkly</li>
                  <li>Look for traces with endpoint <code className="bg-background px-1 rounded">/api/traces/generate</code></li>
                  <li>Click on a trace to see the detailed span breakdown</li>
                  <li>View timing information for each database query and operation</li>
                  <li>See the complete request flow from HTTP to database</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* LaunchDarkly Integration Info */}
          <Card>
            <CardHeader>
              <CardTitle>How LaunchDarkly Captures Traces</CardTitle>
              <CardDescription>
                Understanding the observability integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Automatic Instrumentation</h4>
                  <p className="text-sm text-muted-foreground">
                    The LaunchDarkly Observability plugin uses OpenTelemetry to automatically instrument:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2 ml-4">
                    <li>Express.js HTTP requests and responses</li>
                    <li>PostgreSQL database queries</li>
                    <li>Error tracking and exception handling</li>
                    <li>Performance metrics and timing</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">Distributed Tracing</h4>
                  <p className="text-sm text-muted-foreground">
                    Each trace contains multiple spans that represent:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2 ml-4">
                    <li><strong>Root Span:</strong> The initial HTTP request</li>
                    <li><strong>Child Spans:</strong> Database queries and operations</li>
                    <li><strong>Span Relationships:</strong> Parent-child hierarchy showing request flow</li>
                    <li><strong>Timing Data:</strong> Duration for each operation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Traces;
