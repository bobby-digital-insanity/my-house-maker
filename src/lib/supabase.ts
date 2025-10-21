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
  async getCartItems(userId: string) {
    const { data, error } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", userId);
    return { data, error };
  },

  async addToCart(item: Omit<CartItem, "id">) {
    const { data, error } = await supabase
      .from("cart_items")
      .insert([item])
      .select()
      .single();
    return { data, error };
  },

  async removeFromCart(itemId: string) {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", itemId);
    return { error };
  },

  async clearCart(userId: string) {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", userId);
    return { error };
  },
};
