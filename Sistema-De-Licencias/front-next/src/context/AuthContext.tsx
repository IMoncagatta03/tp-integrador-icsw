"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Define la estructura del usuario en sesión
export interface UsuarioSesion {
  id: number;
  username: string;
  nombre: string;
  apellido: string;
  rol: "ADMINISTRATIVO" | "ADMINISTRADOR";
}

interface AuthContextType {
  usuario: UsuarioSesion | null;
  loading: boolean;
  login: (username: string, contrasenia: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const API_BASE_URL = "http://localhost:8080/api";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Función para iniciar sesión
  const login = async (username: string, contrasenia: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password: contrasenia }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Usuario o contraseña incorrectos.");
      }

      const data: UsuarioSesion = await response.json();
      setUsuario(data);
      router.push("/dashboard");
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    setUsuario(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ usuario, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser utilizado dentro de un AuthProvider");
  }
  return context;
}
