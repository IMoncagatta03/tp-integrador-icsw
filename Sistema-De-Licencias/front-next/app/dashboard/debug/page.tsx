"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/src/context/AuthContext";
import {
  ArrowLeft,
  Settings,
  Search,
  User,
  CreditCard,
  History,
  Info,
  Calendar,
  AlertCircle,
  Clock,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Loader2
} from "lucide-react";

interface Titular {
  id: number;
  tipoDocumento: string;
  numeroDocumento: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  direccion: string;
  grupoSanguineo: string;
  factorRh: string;
  donanteOrganos: boolean;
}

interface Licencia {
  id: number;
  clase: string;
  fechaInicio: string;
  fechaVencimiento: string;
  observaciones: string;
  estado: string;
}

interface Tramite {
  id: number;
  tipoTramite: string;
  fechaTramite: string;
  costoBase: number;
  gastosAdministrativos: number;
  costoTotal: number;
  operador: string;
}

export default function DebugPanelPage() {
  const [titulares, setTitulares] = useState<Titular[]>([]);
  const [loadingTitulares, setLoadingTitulares] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados del desvío de fecha simulada
  const [diasOffset, setDiasOffset] = useState<number>(0);
  const [loadingOffset, setLoadingOffset] = useState(true);
  const [savingOffset, setSavingOffset] = useState(false);
  const [offsetSuccess, setOffsetSuccess] = useState<string | null>(null);
  const [offsetError, setOffsetError] = useState<string | null>(null);

  const cargarOffset = async () => {
    setLoadingOffset(true);
    try {
      const res = await fetch(`${API_BASE_URL}/configuracion`);
      if (res.ok) {
        const data = await res.json();
        const offsetItem = data.find((item: any) => item.clave === "FECHA_SIMULADA_DIAS_OFFSET");
        if (offsetItem) {
          setDiasOffset(Math.round(offsetItem.valor));
        }
      }
    } catch (err) {
      console.error("Error al cargar desvío de fecha:", err);
    } finally {
      setLoadingOffset(false);
    }
  };

  const guardarOffset = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingOffset(true);
    setOffsetSuccess(null);
    setOffsetError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/configuracion`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([{ clave: "FECHA_SIMULADA_DIAS_OFFSET", valor: diasOffset }])
      });
      if (!res.ok) {
        throw new Error("No se pudo actualizar el desvío de fecha en el servidor.");
      }
      setOffsetSuccess("Fecha simulada actualizada correctamente.");
      window.dispatchEvent(new CustomEvent("fechaSistemaActualizada"));
      setTimeout(() => setOffsetSuccess(null), 3000);
    } catch (err: any) {
      setOffsetError(err.message || "Error al actualizar desvío de fecha.");
    } finally {
      setSavingOffset(false);
    }
  };

  // Filtros de búsqueda
  const [searchQuery, setSearchQuery] = useState("");

  // Titular seleccionado
  const [selectedTitular, setSelectedTitular] = useState<Titular | null>(null);
  const [licencias, setLicencias] = useState<Licencia[]>([]);
  const [loadingLicencias, setLoadingLicencias] = useState(false);

  // Licencia seleccionada para trámites
  const [selectedLicenciaId, setSelectedLicenciaId] = useState<number | null>(null);
  const [tramites, setTramites] = useState<Tramite[]>([]);
  const [loadingTramites, setLoadingTramites] = useState(false);

  // Cargar todos los titulares al montar la página
  const cargarTitulares = async () => {
    setLoadingTitulares(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/titulares`);
      if (!response.ok) {
        throw new Error("No se pudo obtener la lista de titulares.");
      }
      const data: Titular[] = await response.json();
      setTitulares(data);
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setLoadingTitulares(false);
    }
  };

  useEffect(() => {
    cargarTitulares();
    cargarOffset();
  }, []);

  // Buscar licencias cuando cambia el titular seleccionado
  useEffect(() => {
    const cargarLicencias = async () => {
      if (!selectedTitular) {
        setLicencias([]);
        setSelectedLicenciaId(null);
        setTramites([]);
        return;
      }
      setLoadingLicencias(true);
      setSelectedLicenciaId(null);
      setTramites([]);
      try {
        const response = await fetch(`${API_BASE_URL}/licencias/titular/${selectedTitular.id}`);
        if (!response.ok) {
          throw new Error("No se pudieron cargar las licencias de este titular.");
        }
        const data: Licencia[] = await response.json();
        setLicencias(data);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoadingLicencias(false);
      }
    };
    cargarLicencias();
  }, [selectedTitular]);

  // Buscar trámites de una licencia
  const verTramites = async (licenciaId: number) => {
    setSelectedLicenciaId(licenciaId);
    setLoadingTramites(true);
    setTramites([]);
    try {
      const response = await fetch(`${API_BASE_URL}/licencias/${licenciaId}/tramites`);
      if (!response.ok) {
        throw new Error("No se pudieron cargar los trámites asociados.");
      }
      const data: Tramite[] = await response.json();
      setTramites(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingTramites(false);
    }
  };

  // Filtrar lista de titulares localmente
  const titularesFiltrados = titulares.filter((t) => {
    const fullSearch = `${t.nombre} ${t.apellido} ${t.numeroDocumento}`.toLowerCase();
    return fullSearch.includes(searchQuery.toLowerCase());
  });

  const obtenerEdad = (fechaNacStr: string) => {
    const nacimiento = new Date(fechaNacStr);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Botón Volver */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Panel Central
        </Link>
      </div>

      {/* Título Principal */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-indigo-400">
          <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <Settings className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Panel de Depuración y Auditoría</h1>
            <p className="text-sm text-slate-400">Inspecciona y monitorea en tiempo real los datos cargados en la base de datos</p>
          </div>
        </div>
        
        <button
          onClick={cargarTitulares}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 hover:border-slate-600 transition-all flex items-center gap-2"
        >
          <History className="w-4 h-4" />
          Refrescar Datos
        </button>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 px-4 py-3.5 rounded-xl text-rose-400 text-sm font-semibold flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Widget de Simulación de Tiempo */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-500" />
          Simulador de Tiempo y Adelantador de Días
        </h2>
        <p className="text-xs text-slate-400">
          Adelanta días en el sistema para simular el paso del tiempo. Esto permite probar el vencimiento de licencias y los controles de antigüedad sin tener que esperar días reales.
        </p>

        <form onSubmit={guardarOffset} className="flex flex-wrap items-end gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Días a adelantar
            </label>
            <input
              type="number"
              min="0"
              value={diasOffset}
              onChange={(e) => setDiasOffset(parseInt(e.target.value) || 0)}
              className="w-32 bg-slate-900 border border-slate-800 focus:outline-none focus:border-orange-500 rounded-xl px-3 py-2 text-sm text-slate-200 font-bold text-center"
            />
          </div>

          <button
            type="submit"
            disabled={savingOffset || loadingOffset}
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-orange-600/20 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {savingOffset ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Actualizando...
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5" />
                Actualizar Fecha Sistema
              </>
            )}
          </button>

          {offsetSuccess && (
            <div className="text-xs font-semibold text-emerald-400 py-2.5 px-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 animate-fade-in">
              {offsetSuccess}
            </div>
          )}
          {offsetError && (
            <div className="text-xs font-semibold text-rose-450 py-2.5 px-3 bg-rose-500/10 rounded-xl border border-rose-500/20 animate-shake">
              {offsetError}
            </div>
          )}
        </form>
      </div>

      {/* Cuerpo Principal del Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUMNA IZQUIERDA: Listado de Titulares (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" />
            Titulares Cargados ({titularesFiltrados.length})
          </h2>

          {/* Input de Búsqueda */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre o DNI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 font-medium placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Lista Scrolleable */}
          {loadingTitulares ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500 text-sm">
              <div className="w-8 h-8 rounded-full border-2 border-slate-800 border-t-indigo-500 animate-spin"></div>
              <span>Cargando conductores...</span>
            </div>
          ) : titularesFiltrados.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm bg-slate-950/40 rounded-xl border border-slate-800/50">
              No se encontraron titulares en el sistema.
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {titularesFiltrados.map((t) => {
                const isSelected = selectedTitular?.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTitular(t)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex justify-between items-center group ${
                      isSelected
                        ? "bg-indigo-500/10 border-indigo-500 text-indigo-300"
                        : "bg-slate-950/40 border-slate-800/80 hover:border-slate-700 text-slate-300 hover:text-slate-100"
                    }`}
                  >
                    <div className="space-y-1">
                      <p className="font-bold text-sm leading-tight">
                        {t.apellido}, {t.nombre}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                        <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-400 font-bold border border-slate-700/60">
                          {t.tipoDocumento}
                        </span>
                        {t.numeroDocumento}
                        <span className="text-[10px] text-slate-600">•</span>
                        <span>{obtenerEdad(t.fechaNacimiento)} años</span>
                      </p>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-transform ${
                      isSelected ? "translate-x-1 text-indigo-400" : ""
                    }`} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: Detalle, Licencias y Auditoría (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Si no hay titular seleccionado */}
          {!selectedTitular ? (
            <div className="bg-slate-900 border border-slate-800 border-dashed rounded-2xl p-12 text-center text-slate-500 space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto text-slate-400">
                <Info className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-300 text-base">Ningún Titular Seleccionado</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Selecciona uno de los titulares de la columna izquierda para inspeccionar su ficha médica, licencias vigentes/expiradas y auditoría de trámites.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* FICHA TÉCNICA DEL TITULAR */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                    <User className="w-4.5 h-4.5 text-indigo-400" />
                    Ficha Técnica Completa
                  </h3>
                  <span className="text-[10px] font-mono font-bold text-slate-500">ID REG: #{selectedTitular.id}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">Nombre Completo</span>
                    <span className="font-bold text-slate-200 text-sm">
                      {selectedTitular.apellido}, {selectedTitular.nombre}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Documento</span>
                    <span className="font-bold text-slate-200 text-sm">
                      {selectedTitular.tipoDocumento} {selectedTitular.numeroDocumento}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Dirección</span>
                    <span className="font-medium text-slate-300">{selectedTitular.direccion}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Grupo Sanguíneo y Factor</span>
                    <span className="font-bold text-rose-400 text-sm">
                      {selectedTitular.grupoSanguineo} {selectedTitular.factorRh}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Fecha Nacimiento (Edad)</span>
                    <span className="font-semibold text-slate-300">
                      {new Date(selectedTitular.fechaNacimiento).toLocaleDateString("es-AR")} ({obtenerEdad(selectedTitular.fechaNacimiento)} años)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Donante de Órganos</span>
                    <span className={`inline-flex items-center gap-1 font-bold mt-1 px-2.5 py-0.5 rounded-full border text-[10px] ${
                      selectedTitular.donanteOrganos 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}>
                      {selectedTitular.donanteOrganos ? "Sí, donante registrado" : "No registrado"}
                    </span>
                  </div>
                </div>
              </div>

              {/* LISTADO DE LICENCIAS ASOCIADAS */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
                  <CreditCard className="w-4.5 h-4.5 text-indigo-400" />
                  Licencias Registradas ({licencias.length})
                </h3>

                {loadingLicencias ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="w-6 h-6 rounded-full border-2 border-slate-800 border-t-indigo-500 animate-spin"></div>
                  </div>
                ) : licencias.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500 bg-slate-950/20 rounded-xl border border-slate-800/50">
                    Este titular no tiene ninguna licencia emitida en el sistema.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {licencias.map((lic) => {
                      const isInspecting = selectedLicenciaId === lic.id;
                      const isVigente = lic.estado === "VIGENTE";
                      const isExpirada = lic.estado === "EXPIRADA";

                      return (
                        <div
                          key={lic.id}
                          className={`p-4 rounded-xl border bg-slate-950/30 transition-all ${
                            isInspecting ? "border-indigo-500/50" : "border-slate-800/80"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="bg-indigo-600 text-white font-extrabold text-xs px-2.5 py-0.5 rounded">
                                  Clase {lic.clase}
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                                  isVigente
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : isExpirada
                                    ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                    : "bg-slate-800 text-slate-400 border-slate-700"
                                }`}>
                                  {lic.estado}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                <span>Desde: {new Date(lic.fechaInicio).toLocaleDateString("es-AR")}</span>
                                <span className="text-slate-600">|</span>
                                <span>Hasta: {new Date(lic.fechaVencimiento).toLocaleDateString("es-AR")}</span>
                              </p>
                              {lic.observaciones && (
                                <p className="text-xs text-amber-400 font-medium italic pt-1">
                                  Obs: {lic.observaciones}
                                </p>
                              )}
                            </div>

                            <button
                              onClick={() => verTramites(lic.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${
                                isInspecting
                                  ? "bg-indigo-600 text-white border-transparent"
                                  : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-100"
                              }`}
                            >
                              <FileText className="w-3.5 h-3.5" />
                              Auditar Trámites
                            </button>
                          </div>

                          {/* Seccion de Auditoria de Tramites de la Licencia seleccionada */}
                          {isInspecting && (
                            <div className="mt-4 border-t border-slate-900 pt-4 space-y-3">
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                <History className="w-3.5 h-3.5 text-indigo-400" />
                                Historial de Auditoría (Trámites)
                              </h4>

                              {loadingTramites ? (
                                <div className="flex justify-center items-center py-4">
                                  <div className="w-5 h-5 rounded-full border-2 border-slate-900 border-t-indigo-500 animate-spin"></div>
                                </div>
                              ) : tramites.length === 0 ? (
                                <div className="text-center py-3 text-[11px] text-slate-600">
                                  No hay auditorías registradas para esta licencia.
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {tramites.map((tr) => (
                                    <div
                                      key={tr.id}
                                      className="bg-slate-950/60 border border-slate-900 rounded-lg p-3 text-xs flex justify-between items-center gap-4"
                                    >
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold text-slate-300">
                                            Trámite: {tr.tipoTramite}
                                          </span>
                                          <span className="text-[10px] text-slate-500 font-medium">
                                            ({new Date(tr.fechaTramite).toLocaleString("es-AR")})
                                          </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500">
                                          Operador: <span className="font-semibold text-slate-400">{tr.operador}</span>
                                        </p>
                                      </div>

                                      <div className="text-right">
                                        <span className="text-[10px] text-slate-500 block">Costo Cobrado</span>
                                        <span className="font-bold text-indigo-400 text-sm">
                                          ${tr.costoTotal.toFixed(2)}
                                        </span>
                                        <span className="text-[9px] text-slate-600 block leading-none">
                                          (Base: ${tr.costoBase.toFixed(2)} + Gastos: ${tr.gastosAdministrativos.toFixed(2)})
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
}
