"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth, API_BASE_URL } from "@/src/context/AuthContext";
import {
  UserPlus,
  UserCog,
  FilePlus,
  FileCheck,
  Settings,
  Edit2,
  X,
  Check,
  DollarSign,
  AlertCircle
} from "lucide-react";

interface Configuracion {
  clave: string;
  valor: number;
  descripcion: string;
}

interface Tarifa {
  clase: string;
  vigenciaAnos: number;
  costo: number;
}

export default function DashboardPage() {
  const { usuario } = useAuth();
  const isAdmin = usuario?.rol === "ADMINISTRADOR";
  const isAdministrativo = usuario?.rol === "ADMINISTRATIVO";

  // Estados de datos
  const [configuraciones, setConfiguraciones] = useState<Configuracion[]>([]);
  const [tarifas, setTarifas] = useState<Tarifa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Estados de edición inline
  const [isEditing, setIsEditing] = useState(false);
  const [tempConfiguraciones, setTempConfiguraciones] = useState<Configuracion[]>([]);
  const [tempTarifas, setTempTarifas] = useState<Tarifa[]>([]);
  const [selectedClase, setSelectedClase] = useState<string>("A");

  const accesosRapidos = [
    {
      titulo: "Dar de Alta Titular",
      descripcion: "Registrar datos personales y tipo sanguíneo de un nuevo conductor.",
      href: "/dashboard/titulares/alta",
      icon: UserPlus,
      color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/20 text-emerald-400 group-hover:border-emerald-500/50",
      bgHover: "hover:shadow-emerald-500/5 hover:to-emerald-950/10",
    },
    {
      titulo: "Modificar Titular",
      descripcion: "Actualizar datos personales o médicos de un titular registrado.",
      href: "/dashboard/titulares/modificar",
      icon: UserCog,
      color: "from-sky-500/20 to-indigo-500/10 border-sky-500/20 text-sky-400 group-hover:border-sky-500/50",
      bgHover: "hover:shadow-sky-500/5 hover:to-sky-950/10",
    },
    {
      titulo: "Emitir Licencia",
      descripcion: "Generar una licencia nueva evaluando la clase correspondiente.",
      href: "/dashboard/licencias/emitir",
      icon: FilePlus,
      color: "from-indigo-500/20 to-violet-500/10 border-indigo-500/20 text-indigo-400 group-hover:border-indigo-500/50",
      bgHover: "hover:shadow-indigo-500/5 hover:to-indigo-950/10",
    },
    {
      titulo: "Renovar Licencia",
      descripcion: "Gestionar la renovación y actualización de la aptitud médica.",
      href: "/dashboard/licencias/renovar",
      icon: FileCheck,
      color: "from-amber-500/20 to-orange-500/10 border-amber-500/20 text-amber-400 group-hover:border-amber-500/50",
      bgHover: "hover:shadow-amber-500/5 hover:to-amber-950/10",
    },
  ];

  // Añadimos accesos directos para la gestión de usuarios si es Administrativo
  const accesosVisibles = [...accesosRapidos];
  if (isAdministrativo) {
    accesosVisibles.push(
      {
        titulo: "Dar de Alta Usuario",
        descripcion: "Registrar un nuevo operador en el sistema con sus privilegios.",
        href: "/dashboard/usuarios/alta",
        icon: UserPlus,
        color: "from-sky-500/20 to-cyan-500/10 border-sky-500/20 text-sky-400 group-hover:border-sky-500/50",
        bgHover: "hover:shadow-sky-500/5 hover:to-sky-950/10",
      },
      {
        titulo: "Modificar Usuario",
        descripcion: "Actualizar datos, rol, estado activo o contraseña de un operador.",
        href: "/dashboard/usuarios/modificar",
        icon: UserCog,
        color: "from-rose-500/20 to-pink-500/10 border-rose-500/20 text-rose-400 group-hover:border-rose-500/50",
        bgHover: "hover:shadow-rose-500/5 hover:to-rose-950/10",
      }
    );
  }

  // Carga inicial de datos desde la API
  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resConfig, resTarifas] = await Promise.all([
        fetch(`${API_BASE_URL}/configuracion`),
        fetch(`${API_BASE_URL}/configuracion/tarifas`)
      ]);

      if (!resConfig.ok || !resTarifas.ok) {
        throw new Error("No se pudieron cargar los precios del sistema desde el servidor.");
      }

      const dataConfig: Configuracion[] = await resConfig.json();
      const dataTarifas: Tarifa[] = await resTarifas.json();

      setConfiguraciones(dataConfig);
      setTarifas(dataTarifas);
    } catch (err: any) {
      setError(err.message || "Error de conexión con el backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Activa el modo edición copiando los valores a los estados temporales
  const iniciarEdicion = () => {
    setTempConfiguraciones(JSON.parse(JSON.stringify(configuraciones)));
    setTempTarifas(JSON.parse(JSON.stringify(tarifas)));
    setIsEditing(true);
    setSuccessMsg(null);
    setError(null);
  };

  // Cancela la edición y descarta los cambios
  const cancelarEdicion = () => {
    setIsEditing(false);
    setTempConfiguraciones([]);
    setTempTarifas([]);
  };

  // Guarda las ediciones en el servidor
  const guardarEdicion = async () => {
    setError(null);
    setSuccessMsg(null);
    try {
      // 1. Guardar configuraciones generales
      const resConfig = await fetch(`${API_BASE_URL}/configuracion`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tempConfiguraciones),
      });

      // 2. Guardar tarifas de licencias
      const resTarifas = await fetch(`${API_BASE_URL}/configuracion/tarifas`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tempTarifas),
      });

      if (!resConfig.ok || !resTarifas.ok) {
        throw new Error("Error al intentar actualizar los precios en el servidor.");
      }

      setConfiguraciones(tempConfiguraciones);
      setTarifas(tempTarifas);
      setIsEditing(false);
      setSuccessMsg("Precios y tarifas actualizados correctamente.");

      // Disparar evento para actualizar el header con la nueva fecha simulada
      window.dispatchEvent(new CustomEvent("fechaSistemaActualizada"));

      // Limpiar mensaje tras 3 segundos
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || "Error al actualizar la configuración.");
    }
  };

  // Manejar el cambio de valores de configuración general
  const handleConfigChange = (clave: string, valorStr: string) => {
    const valor = parseFloat(valorStr) || 0;
    setTempConfiguraciones(prev =>
      prev.map(c => c.clave === clave ? { ...c, valor } : c)
    );
  };

  // Manejar el cambio de valores de tarifas
  const handleTarifaChange = (clase: string, vigenciaAnos: number, valorStr: string) => {
    const costo = parseFloat(valorStr) || 0;
    setTempTarifas(prev =>
      prev.map(t => (t.clase === clase && t.vigenciaAnos === vigenciaAnos) ? { ...t, costo } : t)
    );
  };

  // Clases únicas para la navegación por pestañas (A, B, C, D, E, F, G)
  const clases = ["A", "B", "C", "D", "E", "F", "G"];

  // Obtener el valor formateado a mostrar
  const formatLabel = (clave: string) => {
    switch (clave) {
      case "GASTOS_ADMINISTRATIVOS": return "Gastos Administrativos";
      case "COSTO_EMISION_BASE": return "Costo Emisión Licencia Base";
      case "COSTO_COPIA": return "Costo Modificación/Copia";
      case "VIGENCIA_MAXIMA": return "Vigencia Máxima Permitida";
      case "FECHA_SIMULADA_DIAS_OFFSET": return "Días adelantados (Simular Tiempo)";
      default: return clave;
    }
  };

  const formatValue = (c: Configuracion) => {
    if (c.clave === "VIGENCIA_MAXIMA") {
      return `${Math.round(c.valor)} años`;
    }
    if (c.clave === "FECHA_SIMULADA_DIAS_OFFSET") {
      return `${Math.round(c.valor)} días`;
    }
    return `$${c.valor.toFixed(2)}`;
  };

  return (
    <div className="space-y-10">
      {/* Encabezado del Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

        {/* Feedback de Operación */}
        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-lg text-emerald-400 text-sm font-semibold flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4" />
            {successMsg}
          </div>
        )}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-lg text-rose-400 text-sm font-semibold flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>

      {/* Opciones prioritarias */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {accesosVisibles.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className={`group relative flex flex-col justify-between p-6 bg-slate-900 border rounded-xl transition-all duration-300 ease-out transform hover:-translate-y-1 hover:shadow-xl ${card.bgHover} border-slate-800`}
              >
                <div className="space-y-4">
                  {/* Icono animado */}
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center border transition-all duration-300 group-hover:scale-110`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  {/* Títulos y descripción */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-400 transition-colors duration-200">
                      {card.titulo}
                    </h3>
                    <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                      {card.descripcion}
                    </p>
                  </div>
                </div>
                {/* Enlace */}
                <div className="mt-6 flex items-center text-xs font-semibold text-slate-500 group-hover:text-indigo-400 transition-colors duration-200">
                  Comenzar trámite &rarr;
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Sección de Precios y Tarifas */}
      <div className="pt-4">

        {/* CONFIGURACIÓN MUNICIPAL Y TARIFAS DE LICENCIA (Inline Edit) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative flex flex-col justify-between">
          <div>
            {/* Header de Tarjeta */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                  <Settings className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-semibold text-slate-200">
                  Precios y Tarifas Municipales
                </h3>
              </div>

              {/* Botón Modificar (visible para todos los operadores si no se está editando) */}
              {!isEditing && (
                <button
                  onClick={iniciarEdicion}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/20 hover:border-transparent transition-all duration-200"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Modificar
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <div className="w-8 h-8 rounded-full border-4 border-slate-800 border-t-indigo-500 animate-spin"></div>
                <span className="text-sm text-slate-500">Cargando precios...</span>
              </div>
            ) : (
              <div className="space-y-8">
                {/* 1. Variables de Configuración General */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                    Precios Administrativos
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(isEditing ? tempConfiguraciones : configuraciones).map((item) => (
                      <div key={item.clave} className="flex justify-between items-center bg-slate-950/40 px-4 py-3 rounded-lg border border-slate-800/60">
                        <span className="text-sm text-slate-400 font-medium">{formatLabel(item.clave)}</span>
                        {isEditing ? (
                          <div className="relative w-28">
                            {!["VIGENCIA_MAXIMA", "FECHA_SIMULADA_DIAS_OFFSET"].includes(item.clave) && (
                              <DollarSign className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            )}
                            <input
                              type="number"
                              step={["VIGENCIA_MAXIMA", "FECHA_SIMULADA_DIAS_OFFSET"].includes(item.clave) ? "1" : "0.5"}
                              min="0"
                              value={item.valor}
                              onChange={(e) => handleConfigChange(item.clave, e.target.value)}
                              className={`w-full bg-slate-900 border border-slate-800 focus:outline-none focus:border-indigo-500 rounded px-2 py-1 text-right text-sm text-slate-200 font-bold ${!["VIGENCIA_MAXIMA", "FECHA_SIMULADA_DIAS_OFFSET"].includes(item.clave) ? "pl-7" : ""
                                }`}
                            />
                          </div>
                        ) : (
                          <span className="text-sm text-slate-200 font-bold bg-slate-950 px-3 py-1 rounded border border-slate-800">
                            {formatValue(item)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Matriz de Tarifas por Clase */}
                <div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 border-b border-slate-800 pb-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Costo de Licencias por Clase
                    </h4>
                    {/* Pestañas de Clases */}
                    <div className="flex flex-wrap gap-1 bg-slate-950/60 p-1 rounded-lg border border-slate-800">
                      {clases.map((clase) => (
                        <button
                          key={clase}
                          onClick={() => setSelectedClase(clase)}
                          className={`px-3 py-1 rounded text-xs font-bold transition-all duration-150 ${selectedClase === clase
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/10"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                            }`}
                        >
                          Clase {clase}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tabla de Tarifas para la clase seleccionada */}
                  <div className="overflow-hidden rounded-lg border border-slate-800">
                    <table className="w-full text-left border-collapse bg-slate-950/20">
                      <thead>
                        <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 text-xs font-bold uppercase">
                          <th className="px-4 py-3">Vigencia</th>
                          <th className="px-4 py-3 text-right">Costo Vigente</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {[1, 2, 3, 4, 5].map((anos) => {
                          const list = isEditing ? tempTarifas : tarifas;
                          const tarifa = list.find(t => t.clase === selectedClase && t.vigenciaAnos === anos);
                          if (!tarifa) return null;

                          return (
                            <tr key={anos} className="hover:bg-slate-950/20 text-sm text-slate-300">
                              <td className="px-4 py-3.5 font-medium">{anos} {anos === 1 ? 'año' : 'años'}</td>
                              <td className="px-4 py-3.5 text-right font-bold text-slate-200">
                                {isEditing ? (
                                  <div className="relative w-28 inline-block">
                                    <DollarSign className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                    <input
                                      type="number"
                                      step="1"
                                      min="0"
                                      value={tarifa.costo}
                                      onChange={(e) => handleTarifaChange(selectedClase, anos, e.target.value)}
                                      className="w-full bg-slate-900 border border-slate-800 focus:outline-none focus:border-indigo-500 rounded pl-7 pr-2 py-1 text-right text-sm text-slate-200 font-bold"
                                    />
                                  </div>
                                ) : (
                                  `$${tarifa.costo.toFixed(2)}`
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botones de Control en Modo Edición */}
          {isEditing && (
            <div className="mt-8 flex justify-end gap-3 border-t border-slate-800 pt-5">
              <button
                onClick={cancelarEdicion}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
              <button
                onClick={guardarEdicion}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/10 active:scale-[0.98] transition-all"
              >
                <Check className="w-4 h-4" />
                Aceptar
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
