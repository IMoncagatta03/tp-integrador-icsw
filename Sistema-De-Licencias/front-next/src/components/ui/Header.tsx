"use client";

import { useEffect, useState } from "react";
import { Bell, LogOut } from "lucide-react";
import { useAuth, API_BASE_URL } from "@/src/context/AuthContext";

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const [fecha, setFecha] = useState("");
  const { usuario, logout } = useAuth();

  const cargarFechaSistema = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/configuracion/fecha-sistema`);
      if (res.ok) {
        const data = await res.json();
        const partes = data.fecha.split("-");
        const fechaObj = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
        const opciones: Intl.DateTimeFormatOptions = {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        };
        const dateStr = fechaObj.toLocaleDateString("es-AR", opciones);
        setFecha(dateStr.charAt(0).toUpperCase() + dateStr.slice(1));
      } else {
        const opciones: Intl.DateTimeFormatOptions = {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        };
        const dateStr = new Date().toLocaleDateString("es-AR", opciones);
        setFecha(dateStr.charAt(0).toUpperCase() + dateStr.slice(1));
      }
    } catch (e) {
      const opciones: Intl.DateTimeFormatOptions = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      };
      const dateStr = new Date().toLocaleDateString("es-AR", opciones);
      setFecha(dateStr.charAt(0).toUpperCase() + dateStr.slice(1));
    }
  };

  useEffect(() => {
    setMounted(true);
    cargarFechaSistema();

    const handleActualizar = () => {
      cargarFechaSistema();
    };

    window.addEventListener("fechaSistemaActualizada", handleActualizar);
    return () => {
      window.removeEventListener("fechaSistemaActualizada", handleActualizar);
    };
  }, []);

  // Formatear nombre completo e iniciales
  const nombreCompleto = usuario ? `${usuario.nombre} ${usuario.apellido}` : "Operador";
  const rolTexto = usuario?.rol === "ADMINISTRADOR" ? "Administrador del Sistema" : "Mesa de Entradas / Operador";
  const iniciales = usuario ? `${usuario.nombre.charAt(0)}${usuario.apellido.charAt(0)}`.toUpperCase() : "OP";

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between print:hidden">
      {/* Fecha actual del sistema */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-400">
          {mounted ? fecha : "Cargando fecha..."}
        </span>
      </div>

      {/* Perfil del operador */}
      <div className="flex items-center gap-4">


        {/* Info de sesión */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right">
            <span className="text-sm font-semibold text-slate-200">{nombreCompleto}</span>
            <span className="text-xs text-slate-500 font-medium">{rolTexto}</span>
          </div>

          <div className="w-9 h-9 rounded-full bg-indigo-600/30 border border-indigo-500 flex items-center justify-center text-indigo-200 font-bold text-sm">
            {iniciales}
          </div>

          {/* Separador */}
          <div className="h-6 w-[1px] bg-slate-800"></div>

          {/* Botón Cerrar Sesión */}
          <button
            onClick={logout}
            title="Cerrar Sesión"
            className="p-2 text-slate-400 hover:text-rose-400 transition-colors duration-200 rounded-lg hover:bg-slate-800/80"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
