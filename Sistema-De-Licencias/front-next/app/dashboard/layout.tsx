"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import Sidebar from "@/src/components/ui/Sidebar";
import Header from "@/src/components/ui/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { usuario, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!usuario && !loading) {
      router.push("/login");
    }
  }, [usuario, loading, router]);

  if (loading || !usuario) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
          <p className="text-slate-400 text-sm font-medium">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Barra lateral fija a la izquierda */}
      <Sidebar />

      {/* Contenido a la derecha del sidebar */}
      <div className="flex-1 pl-72 flex flex-col min-h-screen print:pl-0">
        {/* Barra superior fija en la parte superior */}
        <Header />

        {/* Contenido dinámico inyectado */}
        <main className="flex-1 p-8 overflow-y-auto bg-slate-950 print:p-0">
          {children}
        </main>
      </div>
    </div>
  );
}
