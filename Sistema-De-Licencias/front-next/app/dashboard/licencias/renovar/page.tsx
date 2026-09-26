"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth, API_BASE_URL } from "@/src/context/AuthContext";
import {
  ArrowLeft,
  FileCheck,
  Search,
  User,
  CreditCard,
  Calendar,
  ShieldAlert,
  Award,
  CheckCircle2,
  Printer,
  ChevronRight,
  Loader2,
  DollarSign,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight as ChevronRightIcon
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

interface LicenciaPrevia {
  id: number;
  clase: string;
  fechaInicio: string;
  fechaVencimiento: string;
  observaciones: string;
  estado: string;
}

interface LicenciaRenovada {
  id: number;
  clase: string;
  fechaInicio: string;
  fechaVencimiento: string;
  observaciones: string;
  estado: string;
}

export default function RenovarLicenciaPage() {
  const { usuario } = useAuth();

  // Flujo de pasos
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Búsqueda de Titular y Selección de Licencia, 2: Formulario, 3: Ticket Exito
  const [loadingList, setLoadingList] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Lista total de titulares del sistema (para filtros locales)
  const [titulares, setTitulares] = useState<Titular[]>([]);

  // Filtros de Búsqueda Pending Inputs
  const [tipoDocInput, setTipoDocInput] = useState("TODOS");
  const [numDocInput, setNumDocInput] = useState("");
  const [apellidoInput, setApellidoInput] = useState("");
  const [nombreInput, setNombreInput] = useState("");
  const [fechaNacInput, setFechaNacInput] = useState("");
  const [direccionInput, setDireccionInput] = useState("");
  const [grupoSangInput, setGrupoSangInput] = useState("TODOS");
  const [factorRhInput, setFactorRhInput] = useState("TODOS");
  const [donanteInput, setDonanteInput] = useState("TODOS");

  // Filtros de Búsqueda Applied Values
  const [tipoDocSearch, setTipoDocSearch] = useState("TODOS");
  const [numDocSearch, setNumDocSearch] = useState("");
  const [apellidoSearch, setApellidoSearch] = useState("");
  const [nombreSearch, setNombreSearch] = useState("");
  const [fechaNacSearch, setFechaNacSearch] = useState("");
  const [direccionSearch, setDireccionSearch] = useState("");
  const [grupoSangSearch, setGrupoSangSearch] = useState("TODOS");
  const [factorRhSearch, setFactorRhSearch] = useState("TODOS");
  const [donanteSearch, setDonanteSearch] = useState("TODOS");

  // Paginación de Titulares
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Titular seleccionado y su historial de licencias
  const [titular, setTitular] = useState<Titular | null>(null);
  const [licenciasPrevias, setLicenciasPrevias] = useState<LicenciaPrevia[]>([]);
  const [loadingLicencias, setLoadingLicencias] = useState(false);

  // Licencia seleccionada para renovar
  const [licenciaSeleccionada, setLicenciaSeleccionada] = useState<LicenciaPrevia | null>(null);

  // Confirmar y Modificar Datos
  const [editDonante, setEditDonante] = useState(false);

  // Datos para la nueva licencia a generar
  const [nuevaVigenciaAnos, setNuevaVigenciaAnos] = useState<number | null>(null);
  const [nuevaFechaVencimiento, setNuevaFechaVencimiento] = useState<string | null>(null);
  const [observaciones, setObservaciones] = useState("");
  const [costoDetalle, setCostoDetalle] = useState<{
    costoTarifa: number;
    gastosAdministrativos: number;
    costoTotal: number;
  } | null>(null);

  // Resultado
  const [licenciaRenovada, setLicenciaRenovada] = useState<LicenciaRenovada | null>(null);

  // Cargar lista completa de titulares desde el backend
  const fetchTitulares = async () => {
    setLoadingList(true);
    setSearchError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/titulares`);
      if (!res.ok) {
        throw new Error("No se pudo cargar la lista de titulares.");
      }
      const data = await res.json();
      setTitulares(data);
    } catch (err: any) {
      setSearchError(err.message || "Error al conectar con el servidor.");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchTitulares();
  }, []);

  // Manejar submit de búsqueda (aplica filtros locales)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTipoDocSearch(tipoDocInput);
    setNumDocSearch(numDocInput);
    setApellidoSearch(apellidoInput);
    setNombreSearch(nombreInput);
    setFechaNacSearch(fechaNacInput);
    setDireccionSearch(direccionInput);
    setGrupoSangSearch(grupoSangInput);
    setFactorRhSearch(factorRhInput);
    setDonanteSearch(donanteInput);
    setCurrentPage(1);
    // Limpiar selección previa al buscar de nuevo
    setTitular(null);
    setLicenciasPrevias([]);
    setLicenciaSeleccionada(null);
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setTipoDocInput("TODOS");
    setTipoDocSearch("TODOS");
    setNumDocInput("");
    setNumDocSearch("");
    setApellidoInput("");
    setApellidoSearch("");
    setNombreInput("");
    setNombreSearch("");
    setFechaNacInput("");
    setFechaNacSearch("");
    setDireccionInput("");
    setDireccionSearch("");
    setGrupoSangInput("TODOS");
    setGrupoSangSearch("TODOS");
    setFactorRhInput("TODOS");
    setFactorRhSearch("TODOS");
    setDonanteInput("TODOS");
    setDonanteSearch("TODOS");
    setCurrentPage(1);
    setTitular(null);
    setLicenciasPrevias([]);
    setLicenciaSeleccionada(null);
  };

  // Filtrado local de titulares
  const titularesFiltrados = titulares.filter((t) => {
    const matchTipoDoc = tipoDocSearch === "TODOS" || t.tipoDocumento === tipoDocSearch;
    const matchNumDoc = !numDocSearch || t.numeroDocumento.includes(numDocSearch);
    const matchApellido = !apellidoSearch || t.apellido.toLowerCase().includes(apellidoSearch.toLowerCase());
    const matchNombre = !nombreSearch || t.nombre.toLowerCase().includes(nombreSearch.toLowerCase());
    const matchFechaNac = !fechaNacSearch || t.fechaNacimiento === fechaNacSearch;
    const matchDireccion = !direccionSearch || t.direccion.toLowerCase().includes(direccionSearch.toLowerCase());
    const matchGrupoSang = grupoSangSearch === "TODOS" || t.grupoSanguineo === grupoSangSearch;
    const matchFactorRh = factorRhSearch === "TODOS" || t.factorRh === factorRhSearch;
    const matchDonante =
      donanteSearch === "TODOS" ||
      (donanteSearch === "SI" && t.donanteOrganos === true) ||
      (donanteSearch === "NO" && t.donanteOrganos === false);

    return (
      matchTipoDoc &&
      matchNumDoc &&
      matchApellido &&
      matchNombre &&
      matchFechaNac &&
      matchDireccion &&
      matchGrupoSang &&
      matchFactorRh &&
      matchDonante
    );
  });

  // Paginación
  const totalPages = Math.ceil(titularesFiltrados.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const titularesPaginados = titularesFiltrados.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Seleccionar Conductor para ver licencias
  const seleccionarConductor = async (t: Titular) => {
    setTitular(t);
    setLicenciasPrevias([]);
    setLicenciaSeleccionada(null);
    setLoadingLicencias(true);
    setSearchError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/licencias/titular/${t.id}`);
      if (!res.ok) {
        throw new Error("No se pudieron obtener las licencias del conductor.");
      }
      const data = await res.json();
      setLicenciasPrevias(data);
    } catch (err: any) {
      setSearchError(err.message || "Error al buscar historial de licencias.");
    } finally {
      setLoadingLicencias(false);
    }
  };

  // Seleccionar la licencia que se desea renovar
  const seleccionarLicenciaParaRenovar = async (lic: LicenciaPrevia) => {
    if (!titular) return;
    setSearchError(null);
    setLicenciaSeleccionada(lic);
    setEditDonante(titular.donanteOrganos);
    setActionLoading(true);

    try {
      // 1. Obtener la vigencia que corresponda por la edad actual
      const resVigencia = await fetch(
        `${API_BASE_URL}/licencias/vigencia?titularId=${titular.id}&clase=${lic.clase}`
      );
      if (!resVigencia.ok) {
        const errMsg = await resVigencia.text();
        throw new Error(errMsg || "No se pudo evaluar la vigencia para renovar.");
      }
      const dataVigencia = await resVigencia.json();
      const anos = dataVigencia.vigenciaAnos;
      setNuevaVigenciaAnos(anos);
      setNuevaFechaVencimiento(dataVigencia.fechaVencimiento);

      // 2. Obtener el cálculo de costos
      const resCosto = await fetch(`${API_BASE_URL}/configuracion/calcular-costo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clase: lic.clase,
          vigenciaAnos: anos
        })
      });
      if (!resCosto.ok) {
        throw new Error("No se pudo calcular el costo de la renovación.");
      }
      const dataCosto = await resCosto.json();
      setCostoDetalle(dataCosto);
      
      // Pasar al formulario de confirmación
      setStep(2);
    } catch (err: any) {
      setSearchError(err.message || "Error al preparar la renovación.");
      setLicenciaSeleccionada(null);
    } finally {
      setActionLoading(false);
    }
  };

  // Enviar formulario al backend
  const procesarRenovacion = async () => {
    if (!licenciaSeleccionada || !nuevaVigenciaAnos || !titular) return;

    setActionLoading(true);
    setError(null);

    try {
      // 1. Si el valor de donante cambió, guardarlo primero en el Titular
      if (editDonante !== titular.donanteOrganos) {
        const updateRes = await fetch(`${API_BASE_URL}/titulares/${titular.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            nombre: titular.nombre,
            apellido: titular.apellido,
            direccion: titular.direccion,
            grupoSanguineo: titular.grupoSanguineo,
            factorRh: titular.factorRh,
            donanteOrganos: editDonante,
            tipoDocumento: titular.tipoDocumento,
            numeroDocumento: titular.numeroDocumento,
            fechaNacimiento: titular.fechaNacimiento
          })
        });

        if (!updateRes.ok) {
          const updateData = await updateRes.json().catch(() => ({}));
          throw new Error(updateData.details || updateData.error || "No se pudo actualizar el estado de donante en el titular.");
        }

        // Actualizar titular en memoria local
        const updatedTitular = await updateRes.json();
        setTitular(updatedTitular);
      }

      // 2. Ejecutar la renovación
      const res = await fetch(`${API_BASE_URL}/licencias/renovar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Usuario-Operador-Id": usuario?.id ? usuario.id.toString() : "1"
        },
        body: JSON.stringify({
          idLicenciaAnterior: licenciaSeleccionada.id,
          vigenciaAnosNuevos: nuevaVigenciaAnos,
          observaciones: observaciones
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        let message = "Error al procesar la renovación en el servidor.";
        try {
          const parsed = JSON.parse(errText);
          message = parsed.details || parsed.error || message;
        } catch {
          if (errText) message = errText;
        }
        
        if (message.toLowerCase().includes("archivada")) {
          throw new Error("No se puede renovar una licencia ya expirada");
        }
        throw new Error(message);
      }

      const data: LicenciaRenovada = await res.json();
      setLicenciaRenovada(data);
      setSuccess("Licencia renovada exitosamente en el sistema.");
      setStep(3);
    } catch (err: any) {
      setError(err.message || "Error de red al conectar con el servidor.");
    } finally {
      setActionLoading(false);
    }
  };

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

  const edadTitular = titular ? obtenerEdad(titular.fechaNacimiento) : 0;

  const resetForm = () => {
    setStep(1);
    setTitular(null);
    setLicenciasPrevias([]);
    setLicenciaSeleccionada(null);
    setNuevaVigenciaAnos(null);
    setNuevaFechaVencimiento(null);
    setObservaciones("");
    setCostoDetalle(null);
    setLicenciaRenovada(null);
    setError(null);
    setSuccess(null);
    fetchTitulares();
  };

  return (
    <div className="max-w-5xl space-y-6 pb-16">
      {/* Volver */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors duration-200"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al Panel Central
      </Link>

      {/* Cabecera */}
      <div className="flex items-center gap-4 text-amber-450">
        <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
          <FileCheck className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Renovar Licencia</h1>
          <p className="text-sm text-slate-400">
            Registra una extensión de vigencia por expiración o por actualización de datos personales
          </p>
        </div>
      </div>

      {/* Mensajes de Búsqueda */}
      {searchError && (
        <div className="flex items-start gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm font-semibold">{searchError}</span>
        </div>
      )}

      {/* PASO 1: FILTROS DE BÚSQUEDA Y SELECCIÓN DE CONDUCTOR */}
      {step === 1 && (
        <div className="space-y-6">
          <form onSubmit={handleSearchSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-slate-350 text-sm font-bold border-b border-slate-800 pb-3 uppercase tracking-wide">
              <Search className="w-4 h-4 text-orange-500" />
              <span>Filtros de Búsqueda de Conductores</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Tipo Doc */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Tipo Documento
                </label>
                <select
                  value={tipoDocInput}
                  onChange={(e) => setTipoDocInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="TODOS">Todos</option>
                  <option value="DNI">DNI</option>
                  <option value="LC">LC</option>
                  <option value="LE">LE</option>
                  <option value="PASAPORTE">PASAPORTE</option>
                </select>
              </div>

              {/* Num Doc */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Nro Documento
                </label>
                <input
                  type="text"
                  value={numDocInput}
                  onChange={(e) => setNumDocInput(e.target.value)}
                  placeholder="Ej: 12345678"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Apellido */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Apellido
                </label>
                <input
                  type="text"
                  value={apellidoInput}
                  onChange={(e) => setApellidoInput(e.target.value)}
                  placeholder="Ej: Perez"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={nombreInput}
                  onChange={(e) => setNombreInput(e.target.value)}
                  placeholder="Ej: Juan"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Fecha Nac */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Fecha Nacimiento
                </label>
                <input
                  type="date"
                  value={fechaNacInput}
                  onChange={(e) => setFechaNacInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Dirección */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  value={direccionInput}
                  onChange={(e) => setDireccionInput(e.target.value)}
                  placeholder="Ej: Alem 123"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Grupo Sanguineo */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Grupo Sanguíneo
                </label>
                <select
                  value={grupoSangInput}
                  onChange={(e) => setGrupoSangInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="TODOS">Todos</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="O">O</option>
                </select>
              </div>

              {/* Factor Rh */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Factor RH
                </label>
                <select
                  value={factorRhInput}
                  onChange={(e) => setFactorRhInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="TODOS">Todos</option>
                  <option value="+">+</option>
                  <option value="-">-</option>
                </select>
              </div>

              {/* Donante */}
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Donante de Órganos
                </label>
                <select
                  value={donanteInput}
                  onChange={(e) => setDonanteInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="TODOS">Todos</option>
                  <option value="SI">Donantes</option>
                  <option value="NO">No donantes</option>
                </select>
              </div>

              {/* Botones */}
              <div className="sm:col-span-2 flex justify-end items-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={limpiarFiltros}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-450 border border-slate-800 bg-slate-950 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                >
                  <X className="w-3.5 h-3.5 inline mr-1" />
                  Limpiar Filtros
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-orange-600/20 active:scale-[0.98] transition-all"
                >
                  <Search className="w-3.5 h-3.5" />
                  Buscar Conductor
                </button>
              </div>
            </div>
          </form>

          {/* Tabla de Conductores Encontrados */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest border-b border-slate-800 pb-3">
              Conductores Encontrados ({titularesFiltrados.length})
            </h2>

            {loadingList ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                <span className="text-sm text-slate-400 font-medium">Cargando conductores...</span>
              </div>
            ) : titularesFiltrados.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-slate-850 rounded-xl space-y-1">
                <User className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-bold text-slate-350">No se encontraron conductores</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Utilice los filtros para refinar la búsqueda o de de alta un nuevo titular.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/20">
                  <table className="w-full text-left border-collapse min-w-[750px]">
                    <thead>
                      <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="px-5 py-3">Documento</th>
                        <th className="px-5 py-3">Nombre y Apellido</th>
                        <th className="px-5 py-3">Fecha Nacimiento</th>
                        <th className="px-5 py-3">Grupo y Factor</th>
                        <th className="px-5 py-3 text-center">Donante</th>
                        <th className="px-5 py-3 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 text-sm text-slate-300">
                      {titularesPaginados.map((t) => {
                        const isSelected = titular?.id === t.id;
                        return (
                          <tr
                            key={t.id}
                            className={`transition-colors hover:bg-slate-950/30 ${
                              isSelected ? "bg-orange-500/10 border-l-2 border-orange-500" : ""
                            }`}
                          >
                            <td className="px-5 py-3 font-semibold text-slate-200">
                              {t.tipoDocumento} {t.numeroDocumento}
                            </td>
                            <td className="px-5 py-3 font-bold text-slate-100">
                              {t.apellido}, {t.nombre}
                            </td>
                            <td className="px-5 py-3 text-slate-400">
                              {new Date(t.fechaNacimiento).toLocaleDateString("es-AR")}
                            </td>
                            <td className="px-5 py-3">
                              <span className="text-xs font-bold text-rose-450 bg-rose-500/5 px-2.5 py-0.5 rounded border border-rose-500/10">
                                {t.grupoSanguineo} {t.factorRh}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-center">
                              {t.donanteOrganos ? (
                                <span className="inline-flex text-[10px] font-bold text-emerald-450 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                  Sí
                                </span>
                              ) : (
                                <span className="inline-flex text-[10px] font-semibold text-slate-500 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                                  No
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3 text-center">
                              <button
                                onClick={() => seleccionarConductor(t)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-600/10 hover:bg-orange-600 text-orange-400 hover:text-white border border-orange-500/20 hover:border-transparent transition-all duration-150"
                              >
                                Seleccionar Conductor
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Paginador */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
                    <span className="text-xs text-slate-550 font-medium">
                      Mostrando titulares {startIndex + 1} a{" "}
                      {Math.min(startIndex + ITEMS_PER_PAGE, titularesFiltrados.length)} de{" "}
                      {titularesFiltrados.length}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-40"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {Array.from({ length: totalPages }).map((_, idx) => {
                        const pageNum = idx + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                              currentPage === pageNum
                                ? "bg-orange-600 text-white shadow-md"
                                : "border border-slate-800 bg-slate-950 text-slate-450 hover:bg-slate-800 hover:text-slate-250"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-40"
                      >
                        <ChevronRightIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Historial de Licencias del Conductor Seleccionado */}
          {titular && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-800 pb-3 gap-2">
                <div>
                  <h3 className="font-bold text-slate-200 text-sm">
                    Historial de Carnets de {titular.apellido}, {titular.nombre}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Edad: {edadTitular} años • Documento: {titular.tipoDocumento} {titular.numeroDocumento}
                  </p>
                </div>
                <div className="text-xs font-medium text-slate-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                  Grupo Sanguíneo: <strong className="text-rose-450">{titular.grupoSanguineo} {titular.factorRh}</strong>
                </div>
              </div>

              {loadingLicencias ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                  <span className="text-sm text-slate-400 font-medium">Buscando licencias del titular...</span>
                </div>
              ) : licenciasPrevias.length === 0 ? (
                <div className="py-10 text-center border border-dashed border-slate-850 rounded-xl space-y-2">
                  <ShieldAlert className="w-8 h-8 text-amber-500 mx-auto" />
                  <p className="text-sm font-bold text-slate-350">Sin Licencias Registradas</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    El titular no registra licencias previas en el sistema. Utilice la funcionalidad de{" "}
                    <Link href="/dashboard/licencias/emitir" className="text-indigo-400 font-bold hover:underline">
                      Emitir Licencia
                    </Link>{" "}
                    para registrar su primer carnet.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/20">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="px-5 py-3">ID</th>
                        <th className="px-5 py-3">Clase</th>
                        <th className="px-5 py-3">Emisión</th>
                        <th className="px-5 py-3">Vencimiento</th>
                        <th className="px-5 py-3">Estado</th>
                        <th className="px-5 py-3 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 text-sm text-slate-300">
                      {licenciasPrevias.map((lic) => (
                        <tr key={lic.id} className="transition-colors hover:bg-slate-950/30">
                          <td className="px-5 py-3 font-semibold text-slate-400">#{lic.id}</td>
                          <td className="px-5 py-3 font-bold text-slate-200">
                            <span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 text-xs">
                              Clase {lic.clase}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-slate-400">
                            {new Date(lic.fechaInicio).toLocaleDateString("es-AR")}
                          </td>
                          <td className="px-5 py-3 text-slate-400">
                            {new Date(lic.fechaVencimiento).toLocaleDateString("es-AR")}
                          </td>
                          <td className="px-5 py-3">
                            {lic.estado === "VIGENTE" ? (
                              <span className="text-[10px] font-bold text-emerald-450 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                Vigente
                              </span>
                            ) : lic.estado === "EXPIRADA" ? (
                              <span className="text-[10px] font-bold text-rose-450 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                                Expirada
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                                Inactiva (Modif. datos)
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-center">
                            <button
                              onClick={() => seleccionarLicenciaParaRenovar(lic)}
                              disabled={actionLoading}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-600/10 hover:bg-orange-600 text-orange-450 hover:text-white border border-orange-500/20 hover:border-transparent transition-all duration-150"
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                              Renovar Licencia
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* PASO 2: FORMULARIO DE CONFIRMACIÓN */}
      {step === 2 && licenciaSeleccionada && nuevaVigenciaAnos && costoDetalle && titular && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-350 uppercase tracking-widest">
              Confirmación de Trámite de Renovación
            </h2>
            <span className="text-xs font-medium text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
              Operador: {usuario?.nombre || "Administrativo"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Resumen Licencia Anterior */}
            <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-5 space-y-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Licencia Anterior a Archivar
              </span>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">ID de Registro:</span>
                  <span className="text-slate-300 font-semibold">#{licenciaSeleccionada.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Clase:</span>
                  <span className="text-slate-300 font-semibold">Clase {licenciaSeleccionada.clase}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Estado previo:</span>
                  <span className="font-semibold text-amber-400 capitalize">{licenciaSeleccionada.estado.toLowerCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Vencimiento original:</span>
                  <span className="text-slate-300">
                    {new Date(licenciaSeleccionada.fechaVencimiento).toLocaleDateString("es-AR")}
                  </span>
                </div>
              </div>
            </div>

            {/* Nueva Licencia Estimada */}
            <div className="bg-gradient-to-br from-slate-950 to-indigo-950/20 border border-indigo-500/20 rounded-xl p-5 space-y-3">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                Nueva Habilitación Sugerida
              </span>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Clase Solicitada:</span>
                  <span className="text-indigo-400 font-bold">Clase {licenciaSeleccionada.clase}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Vigencia calculada:</span>
                  <span className="text-slate-200 font-semibold">{nuevaVigenciaAnos} años</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Nuevo Vencimiento:</span>
                  <span className="text-indigo-400 font-bold">
                    {nuevaFechaVencimiento ? new Date(nuevaFechaVencimiento).toLocaleDateString("es-AR") : ""}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 leading-normal pt-1">
                  * La fecha de vencimiento ha sido ajustada automáticamente para alinearse con el cumpleaños del titular.
                </div>
              </div>
            </div>
          </div>

          {/* Desglose de Costo de Renovación */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-3">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">
              Desglose de Tasas y Costo del Trámite
            </span>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Costo de Licencia Base (Clase {licenciaSeleccionada.clase} - {nuevaVigenciaAnos} años):</span>
                <span className="text-slate-200 font-medium">${costoDetalle.costoTarifa.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Gastos Administrativos del Sistema:</span>
                <span className="text-slate-200 font-medium">${costoDetalle.gastosAdministrativos.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300 font-bold border-t border-slate-900 pt-2 text-base">
                <span>Costo Total del Trámite:</span>
                <span className="text-orange-400">${costoDetalle.costoTotal.toFixed(2)}</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal">
                * Conforme a la reglamentación, el costo de renovación por modificación de datos o expiración es equivalente al de una nueva emisión.
              </p>
            </div>
          </div>

          {/* Habilitar Cambiar Estado de Donante de Órganos */}
          <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-5 space-y-3">
            <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider block">
              Voluntad del Donante de Órganos (Actualización)
            </span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editDonante}
                  onChange={(e) => setEditDonante(e.target.checked)}
                  className="w-4.5 h-4.5 bg-slate-950 border border-slate-850 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
                />
                <div>
                  <span className="text-sm font-semibold text-slate-200">¿Desea registrarse como Donante de Órganos?</span>
                  <p className="text-[11px] text-slate-500">Marque esta casilla si el titular ratifica o cambia su consentimiento de donación</p>
                </div>
              </label>
            </div>
          </div>

          {/* Observaciones médicas / limitaciones */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Observaciones del Examen Médico o Limitaciones Físicas (Opcional)
            </label>
            <textarea
              rows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ej: Requiere uso de lentes correctores. Sin limitaciones de manejo en horario nocturno."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 text-sm placeholder-slate-650 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Mensajes de Confirmación/Error de Renovación */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-450 mt-4">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm font-semibold">{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 mt-4">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm font-semibold">{success}</span>
            </div>
          )}

          {/* Acciones */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={resetForm}
              disabled={actionLoading}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={procesarRenovacion}
              disabled={actionLoading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/20 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4" />
                  Confirmar Renovación
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* PASO 3: DETALLE DE LIQUIDACIÓN Y ÉXITO */}
      {step === 3 && licenciaRenovada && costoDetalle && titular && (
        <div className="space-y-8 border-t border-slate-800/80 pt-6 animate-fade-in">
          {/* Cabecera Éxito */}
          <div className="text-center space-y-2 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-100">Licencia Renovada Correctamente</h2>
            <p className="text-sm text-slate-400">El registro de extensión de vigencia se guardó con éxito en el sistema.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Carnet Renovado */}
            <div className="flex flex-col items-center justify-center space-y-3 bg-slate-950/20 border border-slate-800 rounded-2xl p-6">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Carnet Renovado</span>

              {/* Carnet de Conducir */}
              <div className="w-full max-w-[320px] aspect-[1.586/1] rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/40 p-5 relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))]"></div>

                <div className="flex justify-between items-start border-b border-indigo-500/20 pb-2 relative z-10">
                  <div>
                    <span className="text-[8px] font-extrabold text-indigo-300 uppercase tracking-widest block">República Argentina</span>
                    <span className="text-[6px] text-slate-400 font-semibold tracking-wider block">LICENCIA NACIONAL DE CONDUCIR</span>
                  </div>
                  <div className="bg-indigo-600 text-white font-extrabold text-base px-2.5 py-0.5 rounded-lg">
                    {licenciaRenovada.clase}
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-3 mt-4 relative z-10">
                  <div className="col-span-4 aspect-square rounded-lg bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-slate-700">
                    <User className="w-7 h-7 text-slate-800" />
                    <span className="text-[6px] text-slate-600 font-bold">RENOVADO</span>
                  </div>

                  <div className="col-span-8 space-y-1 text-[8px] leading-snug">
                    <div>
                      <span className="text-slate-500 block text-[6px] font-bold">APELLIDO, NOMBRE</span>
                      <span className="font-bold text-slate-200 uppercase truncate block">
                        {titular.apellido}, {titular.nombre}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <div>
                        <span className="text-slate-500 block text-[6px] font-bold">DOCUMENTO</span>
                        <span className="font-semibold text-slate-300">{titular.numeroDocumento}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[6px] font-bold">TIPO DE SANGRE</span>
                        <span className="font-bold text-rose-400">{titular.grupoSanguineo} {titular.factorRh}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <div>
                        <span className="text-slate-500 block text-[6px] font-bold">EMISIÓN</span>
                        <span className="font-medium text-slate-400">
                          {new Date(licenciaRenovada.fechaInicio).toLocaleDateString("es-AR")}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[6px] font-bold">VENCIMIENTO</span>
                        <span className="font-bold text-indigo-400">
                          {new Date(licenciaRenovada.fechaVencimiento).toLocaleDateString("es-AR")}
                        </span>
                      </div>
                    </div>
                    {licenciaRenovada.observaciones && (
                      <div className="border-t border-indigo-500/10 pt-0.5 mt-0.5">
                        <span className="text-slate-500 block text-[5px] font-bold">OBSERVACIONES / LIMITACIONES</span>
                        <span className="font-bold text-amber-400 block text-[7px] uppercase truncate">
                          {licenciaRenovada.observaciones}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="absolute bottom-2.5 right-4 flex items-center gap-2 text-[5px] text-slate-500">
                  <div className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold tracking-widest uppercase">
                    Vigente
                  </div>
                </div>
              </div>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-400 font-bold block">ID Registro: #{licenciaRenovada.id}</span>
                <span className="text-[10px] text-slate-500 mt-1 block">Estado: {licenciaRenovada.estado}</span>
              </div>
            </div>

            {/* Detalle de Liquidación (Invoice/Factura) */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
                  <DollarSign className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-slate-200 text-sm">Detalle del Pago y Liquidación</h3>
                </div>

                <div className="space-y-3.5 text-sm">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Concepto</span>
                    <span className="text-slate-200 font-medium">Renovación Licencia Clase {licenciaRenovada.clase}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Vigencia otorgada</span>
                    <span className="text-slate-200 font-medium">{nuevaVigenciaAnos} {nuevaVigenciaAnos === 1 ? 'año' : 'años'}</span>
                  </div>

                  <div className="border-t border-slate-900 my-2 pt-2 space-y-2">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Costo Base Licencia</span>
                      <span className="text-slate-200 font-semibold">${costoDetalle.costoTarifa.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Gastos Administrativos</span>
                      <span className="text-slate-200 font-semibold">${costoDetalle.gastosAdministrativos.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-slate-100 font-bold text-base">
                    <span>Total Abonado</span>
                    <span className="text-orange-400">${costoDetalle.costoTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Botón Imprimir */}
              <div className="pt-6">
                <button
                  onClick={() => window.print()}
                  className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md active:scale-[0.98] transition-all"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir Comprobante
                </button>
              </div>
            </div>
          </div>

          {/* Botón Finalizar */}
          <div className="flex justify-end pt-4">
            <button
              onClick={resetForm}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all active:scale-[0.98]"
            >
              Realizar otra Renovación
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
