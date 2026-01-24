// src/lib/supabase.ts - Updated to use your API instead of Supabase

// API URL configuration:
// - In development: uses http://localhost:3001
// - In production: uses VITE_API_URL if set, otherwise tries to use same origin
// For EC2: Set VITE_API_URL to your EC2 server URL (e.g., http://your-ec2-ip:3001 or http://your-domain.com:3001)
const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:3001' : `${window.location.protocol}//${window.location.hostname}:3001`);

export interface User {
  id: string;
  email: string;
  full_name?: string;
}

export interface Session {
  access_token: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
}

// Helper to get auth token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Helper to set auth token
const setToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

// Helper to remove auth token
const removeToken = (): void => {
  localStorage.removeItem('auth_token');
};

// Helper to get user from localStorage
const getUser = (): User | null => {
  const userStr = localStorage.getItem('auth_user');
  return userStr ? JSON.parse(userStr) : null;
};

// Helper to set user in localStorage
const setUser = (user: User): void => {
  localStorage.setItem('auth_user', JSON.stringify(user));
};

// Helper to remove user from localStorage
const removeUser = (): void => {
  localStorage.removeItem('auth_user');
};

export const authService = {
  async signUp(email: string, password: string, fullName: string) {
    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, fullName }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { data: null, error: { message: data.error || 'Signup failed' } };
      }

      // Store token and user
      if (data.session?.access_token) {
        setToken(data.session.access_token);
      }
      if (data.user) {
        setUser(data.user);
        // Trigger auth state change event
        window.dispatchEvent(new Event('authStateChanged'));
      }

      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: { message: error instanceof Error ? error.message : 'Network error' },
      };
    }
  },

  async signIn(email: string, password: string) {
    try {
      const response = await fetch(`${API_URL}/api/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('SignIn API response:', data);

      if (!response.ok) {
        console.error('SignIn failed:', data.error);
        return { data: null, error: { message: data.error || 'Signin failed' } };
      }

      // Store token and user
      if (data.session?.access_token) {
        setToken(data.session.access_token);
        console.log('✅ Token stored');
      } else {
        console.warn('⚠️ No access_token in response');
      }
      
      if (data.user) {
        console.log('Storing user:', data.user);
        setUser(data.user);
        console.log('✅ User stored, verifying:', getUser());
        // Trigger auth state change event
        window.dispatchEvent(new Event('authStateChanged'));
      } else {
        console.error('❌ No user in response. Full response:', data);
      }

      return { data, error: null };
    } catch (error) {
      console.error('SignIn error:', error);
      return {
        data: null,
        error: { message: error instanceof Error ? error.message : 'Network error' },
      };
    }
  },

  async signOut() {
    try {
      const token = getToken();
      if (token) {
        await fetch(`${API_URL}/api/auth/signout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
      removeToken();
      removeUser();
      return { error: null };
    } catch (error) {
      removeToken();
      removeUser();
      return { error: null }; // Always succeed on signout
    }
  },

  async getSession() {
    try {
      const token = getToken();
      const user = getUser();

      if (!token || !user) {
        return { data: { session: null, user: null }, error: null };
      }

      // Verify token is still valid by calling the API
      const response = await fetch(`${API_URL}/api/auth/session`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Token invalid or expired, clear storage
        removeToken();
        removeUser();
        return { data: { session: null, user: null }, error: null };
      }

      const data = await response.json();
      
      // Make sure we have both session and user
      if (data?.session?.user) {
        // Update stored user data with fresh data from server
        setUser(data.user);
        return { data, error: null };
      } else {
        // Invalid response format, clear storage
        removeToken();
        removeUser();
        return { data: { session: null, user: null }, error: null };
      }
    } catch (error) {
      // Network error or other issue, clear potentially stale data
      removeToken();
      removeUser();
      return {
        data: { session: null, user: null },
        error: { message: error instanceof Error ? error.message : 'Network error' },
      };
    }
  },

  onAuthStateChange(callback: (session: Session | null, user: User | null) => void) {
    // Poll for auth state changes (simpler than WebSocket for now)
    let lastUser = getUser();
    
    const checkAuth = () => {
      const currentUser = getUser();
      const token = getToken();
      
      // If user changed, trigger callback
      if (currentUser?.id !== lastUser?.id) {
        lastUser = currentUser;
        callback(
          token && currentUser ? { access_token: token, user: currentUser } : null,
          currentUser
        );
      }
    };

    // Check immediately
    checkAuth();

    // Also listen for storage events (for same-tab updates)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_user' || e.key === 'auth_token') {
        checkAuth();
      }
    };
    
    // Listen for custom event (for same-tab updates)
    const handleCustomStorageChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStateChanged', handleCustomStorageChange);

    // Check every 2 seconds as fallback
    const interval = setInterval(checkAuth, 2000);

    // Return subscription object with unsubscribe
    return {
      unsubscribe: () => {
        clearInterval(interval);
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('authStateChanged', handleCustomStorageChange);
      },
    };
  },
};

export interface CartItem {
  id?: string;
  user_id: string;
  room_type: string;
  style: string;
  price: number;
}

export const cartService = {
  // Guest cart stored in localStorage
  getGuestCart(): CartItem[] {
    const cart = localStorage.getItem("guestCart");
    return cart ? JSON.parse(cart) : [];
  },

  setGuestCart(items: CartItem[]): void {
    localStorage.setItem("guestCart", JSON.stringify(items));
  },

  async getCartItems(userId?: string) {
    if (!userId) {
      // Guest user - return localStorage cart
      return { data: this.getGuestCart(), error: null };
    }

    try {
      const token = getToken();
      if (!token) {
        return { data: this.getGuestCart(), error: null };
      }

      const response = await fetch(`${API_URL}/api/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return { data: [], error: { message: 'Failed to fetch cart' } };
      }

      const result = await response.json();
      return { data: result.data || [], error: null };
    } catch (error) {
      return {
        data: [],
        error: { message: error instanceof Error ? error.message : 'Network error' },
      };
    }
  },

  async addToCart(item: Omit<CartItem, "id">, userId?: string) {
    if (!userId) {
      // Guest user - add to localStorage
      const cart = this.getGuestCart();
      const newItem = { ...item, id: crypto.randomUUID(), user_id: "guest" };
      cart.push(newItem);
      this.setGuestCart(cart);
      return { data: newItem, error: null };
    }

    try {
      const token = getToken();
      if (!token) {
        // Fallback to guest cart
        const cart = this.getGuestCart();
        const newItem = { ...item, id: crypto.randomUUID(), user_id: "guest" };
        cart.push(newItem);
        this.setGuestCart(cart);
        return { data: newItem, error: null };
      }

      const response = await fetch(`${API_URL}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          room_type: item.room_type,
          style: item.style,
          price: item.price,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { data: null, error: { message: error.error || 'Failed to add to cart' } };
      }

      const result = await response.json();
      return { data: result.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: { message: error instanceof Error ? error.message : 'Network error' },
      };
    }
  },

  async removeFromCart(itemId: string, userId?: string) {
    if (!userId) {
      // Guest user - remove from localStorage
      const cart = this.getGuestCart();
      const filtered = cart.filter(item => item.id !== itemId);
      this.setGuestCart(filtered);
      return { error: null };
    }

    try {
      const token = getToken();
      if (!token) {
        // Fallback to guest cart
        const cart = this.getGuestCart();
        const filtered = cart.filter(item => item.id !== itemId);
        this.setGuestCart(filtered);
        return { error: null };
      }

      const response = await fetch(`${API_URL}/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return { error: { message: 'Failed to remove from cart' } };
      }

      return { error: null };
    } catch (error) {
      return {
        error: { message: error instanceof Error ? error.message : 'Network error' },
      };
    }
  },

  async clearCart(userId?: string) {
    if (!userId) {
      // Guest user - clear localStorage
      localStorage.removeItem("guestCart");
      return { error: null };
    }

    try {
      const token = getToken();
      if (!token) {
        localStorage.removeItem("guestCart");
        return { error: null };
      }

      const response = await fetch(`${API_URL}/api/cart`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return { error: { message: 'Failed to clear cart' } };
      }

      return { error: null };
    } catch (error) {
      return {
        error: { message: error instanceof Error ? error.message : 'Network error' },
      };
    }
  },

  async migrateGuestCartToUser(userId: string) {
    // Migrate guest cart to authenticated user
    const guestCart = this.getGuestCart();
    if (guestCart.length === 0) return;

    for (const item of guestCart) {
      await this.addToCart({
        user_id: userId,
        room_type: item.room_type,
        style: item.style,
        price: item.price,
      }, userId);
    }

    localStorage.removeItem("guestCart");
  },
};
