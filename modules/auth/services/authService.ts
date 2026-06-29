"use client";

import { getSupabaseBrowserClient } from "../../../app/lib/supabase/browser-client";

// Inicializamos el cliente de Supabase para el navegador
const supabase = getSupabaseBrowserClient();

export const authService = {
  /**
   * Registra un nuevo usuario en la plataforma utilizando correo y contraseña.
   */
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }
    
    return data;
  },

  /**
   * Inicia sesión de un usuario existente mediante correo y contraseña.
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  },

  /**
   * Cierra la sesión activa del usuario actual.
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  },

  /**
   * Obtiene los datos del usuario que tiene la sesión iniciada.
   */
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      throw error;
    }

    return user;
  }
};