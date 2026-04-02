import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BarChart3 } from "lucide-react";
import { authService, type User } from "@/lib/supabase";
import { useLDClient, useFlags } from "launchdarkly-react-client-sdk";

const Metrics = () => {
  const navigate = useNavigate();
  const ldClient = useLDClient();
  const flags = useFlags();
  const [user, setUser] = useState<User | null>(null);

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
          <BarChart3 className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Metrics</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Application Metrics</CardTitle>
            <CardDescription>
              View detailed metrics and analytics for the application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Metrics and analytics dashboard coming soon. This page will display detailed metrics about feature flag usage, user behavior, and application performance.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Metrics;
