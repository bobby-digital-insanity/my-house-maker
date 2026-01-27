import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ShoppingCart, LogOut, User as UserIcon, Settings } from "lucide-react";
import { authService } from "@/lib/supabase";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { User } from "@/lib/supabase";
import { useEffect, useRef, useState } from "react";

interface NavbarProps {
  user: User | null;
  cartCount?: number;
}

// Helper to get user from localStorage synchronously
const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('auth_user');
  return userStr ? JSON.parse(userStr) : null;
};

const Navbar = ({ user: propUser, cartCount = 0 }: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);
  // Always prioritize stored user first to prevent flash
  const storedUser = getStoredUser();
  const [user, setUser] = useState<User | null>(storedUser);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize: check stored user first, then sync with prop
  useEffect(() => {
    // Start with stored user if available
    if (storedUser) {
      setUser(storedUser);
    }
    
    // Then sync with prop user (which may be more up-to-date)
    if (propUser !== undefined) {
      setUser(propUser);
    }
    
    // Mark as initialized after a brief delay to prevent flash
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);

  // Sync with prop user when it changes after initialization
  useEffect(() => {
    if (isInitialized && propUser !== undefined) {
      setUser(propUser);
    }
  }, [propUser, isInitialized]);

  // Also listen for auth state changes
  useEffect(() => {
    const subscription = authService.onAuthStateChange((session, user) => {
      setUser(user);
      setIsInitialized(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Prevent hover states during route transitions
  useEffect(() => {
    if (navRef.current) {
      navRef.current.classList.add("no-hover");
      const timer = setTimeout(() => {
        navRef.current?.classList.remove("no-hover");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  const handleSignOut = async () => {
    const { error } = await authService.signOut();
    if (error) {
      toast.error("Failed to sign out");
    } else {
      toast.success("Signed out successfully");
      navigate("/auth");
    }
  };

  const settings = async () => {
    navigate("/settings");
  }

  const getUserInitials = (email: string | undefined) => {
    if (!email) return "U";
    const parts = email.split("@")[0];
    return parts.length >= 2 ? parts.substring(0, 2).toUpperCase() : parts[0].toUpperCase();
  };

  // Prevent hover states during route transitions
  useEffect(() => {
    if (navRef.current) {
      navRef.current.classList.add("no-hover");
      const timer = setTimeout(() => {
        navRef.current?.classList.remove("no-hover");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Prevent focus on navigation
    const target = e.currentTarget;
    if (target) {
      // Blur after a tiny delay to prevent focus flash
      setTimeout(() => target.blur(), 0);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold text-lg" onClick={handleLinkClick}>
          <Home className="h-5 w-5" />
          <span>DreamHome Builder</span>
        </Link>

        <div ref={navRef} className="flex items-center gap-4">
          {/* Only show Sign In if we're sure there's no user after initialization */}
          {user || !isInitialized ? (
            user ? (
              <>
                <Link to="/customize" onClick={handleLinkClick} className="focus:outline-none">
                  <Button variant="ghost">Build Your Home</Button>
                </Link>
                <Link to="/cart" className="relative focus:outline-none" onClick={handleLinkClick}>
                  <Button variant="ghost" size="icon">
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-semibold">
                        {cartCount}
                      </span>
                    )}
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{getUserInitials(user.email)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.email?.split('@')[0]}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={settings}>
                      <Settings className="h-4 w-4 mr-2" />
                      Admin Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              // Show placeholder while initializing to prevent flash
              <div className="h-10 w-10" />
            )
          ) : (
            <Link to="/auth" onClick={handleLinkClick} className="focus:outline-none">
              <Button variant="default">
                <UserIcon className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
      <style>{`
        .no-hover button:hover,
        .no-hover a:hover button,
        .no-hover a:focus button {
          background-color: transparent !important;
          color: inherit !important;
        }
        nav a:focus-visible {
          outline: none;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
