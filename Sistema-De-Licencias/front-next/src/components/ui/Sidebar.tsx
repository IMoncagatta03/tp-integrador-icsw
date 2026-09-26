"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import {
  Home,
  UserPlus,
  UserCog,
  FilePlus,
  FileCheck,
  Copy,
  FileClock,
  Search,
  Settings
} from "lucide-react";

interface Option {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface Module {
  title: string;
  options: Option[];
}

export default function Sidebar() {
  const pathname = usePathname();
  const { usuario } = useAuth();
  const isAdministrativo = usuario?.rol === "ADMINISTRATIVO";

  const modulos: Module[] = [
    {
      title: "",
      options: [
        { label: "Inicio", href: "/dashboard", icon: Home }
      ],
    },
    {
      title: "Gestión de Contribuyentes",
      options: [
        { label: "Alta de Titular", href: "/dashboard/titulares/alta", icon: UserPlus },
        { label: "Modificar Titular", href: "/dashboard/titulares/modificar", icon: UserCog },
      ],
    },
    {
      title: "Trámites de Licencias",
      options: [
        { label: "Emitir Licencia", href: "/dashboard/licencias/emitir", icon: FilePlus },
        { label: "Renovar Licencia", href: "/dashboard/licencias/renovar", icon: FileCheck },
        { label: "Emitir Copia", href: "/dashboard/licencias/copia", icon: Copy },
      ],
    },
    {
      title: "Gestión de Usuarios",
      options: [
        { label: "Alta de Usuario", href: "/dashboard/usuarios/alta", icon: UserPlus },
        { label: "Modificar Usuario", href: "/dashboard/usuarios/modificar", icon: UserCog },
      ],
    },
    {
      title: "Consultas y Reportes",
      options: [
        { label: "Licencias Expiradas", href: "/dashboard/reportes/expiradas", icon: FileClock },
        { label: "Búsqueda por Criterios", href: "/dashboard/reportes/criterios", icon: Search },
      ],
    },
  ];

  // Filtramos los módulos de administración de usuarios si el operador no es ADMINISTRATIVO
  const modulosVisibles = modulos.filter((m) => {
    if (m.title === "Gestión de Usuarios" && !isAdministrativo) {
      return false;
    }
    return true;
  });

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 border-r border-slate-800 flex flex-col print:hidden">
      {/* Logo municipal */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-900/50">
        <img src="/logo.png" alt="Santa Fe Provincia" className="h-9 object-contain" />
      </div>

      {/* Listado de Opciones */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {modulosVisibles.map((modulo) => (
          <div key={modulo.title} className="space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3">
              {modulo.title}
            </span>
            <div className="space-y-1">
              {modulo.options.map((option) => {
                const Icon = option.icon;
                const isActive = pathname === option.href;
                return (
                  <Link
                    key={option.href}
                    href={option.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive
                      ? "bg-indigo-500/10 text-indigo-400 font-semibold border-l-2 border-indigo-500 pl-2.5"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                      }`}
                  >
                    <Icon
                      className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-200"
                        }`}
                    />
                    {option.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-center">
        <span className="text-[11px] text-slate-600 font-semibold uppercase tracking-wider block">
          Gobierno de la Provincia
        </span>
      </div>
    </aside>
  );
}
