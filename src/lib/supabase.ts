import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export interface AuthState {
  user: User | null;
  session: Session | null;
}

export const authService = {
  async signUp(email: string, password: string, fullName: string) {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    return { data, error };
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    return { data, error };
  },

  onAuthStateChange(callback: (session: Session | null, user: User | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        callback(session, session?.user ?? null);
      }
    );
    return subscription;
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
    
    const { data, error } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", userId);
    return { data, error };
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

    const { data, error } = await supabase
      .from("cart_items")
      .insert([item])
      .select()
      .single();
    return { data, error };
  },

  async removeFromCart(itemId: string, userId?: string) {
    if (!userId) {
      // Guest user - remove from localStorage
      const cart = this.getGuestCart();
      const filtered = cart.filter(item => item.id !== itemId);
      this.setGuestCart(filtered);
      return { error: null };
    }

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", itemId);
    return { error };
  },

  async clearCart(userId?: string) {
    if (!userId) {
      // Guest user - clear localStorage
      localStorage.removeItem("guestCart");
      return { error: null };
    }

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", userId);
    return { error };
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
