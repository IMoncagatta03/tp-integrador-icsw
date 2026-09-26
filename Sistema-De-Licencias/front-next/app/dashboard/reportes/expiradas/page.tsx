"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth, API_BASE_URL } from "@/src/context/AuthContext";
import {
  ArrowLeft,
  FileClock,
  Search,
  X,
  Printer,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileText
} from "lucide-react";

interface Licencia {
  id: number;
  nombreTitular: string;
  apellidoTitular: string;
  tipoDocumentoTitular: string;
  numeroDocumentoTitular: string;
  grupoSanguineoTitular: string;
  factorRhTitular: string;
  donanteOrganosTitular: boolean;
  clase: string;
  fechaInicio: string;
  fechaVencimiento: string;
  estado: string;
  observaciones: string;
}

export default function LicenciasExpiradasPage() {
  const { usuario } = useAuth();
  
  // Data State
  const [licencias, setLicencias] = useState<Licencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pending Inputs State
  const [searchText, setSearchText] = useState("");
  const [grupoSanguineo, setGrupoSanguineo] = useState("TODOS");
  const [factorRh, setFactorRh] = useState("TODOS");
  const [donante, setDonante] = useState("TODOS");

  // Applied Search State (Only updates when "Buscar" is clicked)
  const [searchTextApplied, setSearchTextApplied] = useState("");
  const [grupoSanguineoApplied, setGrupoSanguineoApplied] = useState("TODOS");
  const [factorRhApplied, setFactorRhApplied] = useState("TODOS");
  const [donanteApplied, setDonanteApplied] = useState("TODOS");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Carga de Licencias Expiradas
  const cargarLicencias = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/licencias/expiradas`);
      if (!response.ok) {
        throw new Error("No se pudo cargar la lista de licencias expiradas.");
      }
      const data: Licencia[] = await response.json();
      setLicencias(data);
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarLicencias();
  }, []);

  // Manejar el submit del formulario (Boton Buscar clickeado)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTextApplied(searchText);
    setGrupoSanguineoApplied(grupoSanguineo);
    setFactorRhApplied(factorRh);
    setDonanteApplied(donante);
    setCurrentPage(1);
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setSearchText("");
    setSearchTextApplied("");
    setGrupoSanguineo("TODOS");
    setGrupoSanguineoApplied("TODOS");
    setFactorRh("TODOS");
    setFactorRhApplied("TODOS");
    setDonante("TODOS");
    setDonanteApplied("TODOS");
    setCurrentPage(1);
  };

  // Filtrado de licencias
  const licenciasFiltradas = licencias.filter((lic) => {
    // 1. Filtro por texto (Nombre, Apellido o Nro de Documento)
    const matchSearch =
      !searchTextApplied ||
      lic.nombreTitular.toLowerCase().includes(searchTextApplied.toLowerCase()) ||
      lic.apellidoTitular.toLowerCase().includes(searchTextApplied.toLowerCase()) ||
      (lic.numeroDocumentoTitular &&
        lic.numeroDocumentoTitular.includes(searchTextApplied));

    // 2. Filtro por Grupo Sanguíneo
    const matchGrupo = grupoSanguineoApplied === "TODOS" || lic.grupoSanguineoTitular === grupoSanguineoApplied;

    // 3. Filtro por Factor RH
    const matchRh = factorRhApplied === "TODOS" || lic.factorRhTitular === factorRhApplied;

    // 4. Filtro por Donante
    const matchDonante =
      donanteApplied === "TODOS" ||
      (donanteApplied === "SI" && lic.donanteOrganosTitular === true) ||
      (donanteApplied === "NO" && lic.donanteOrganosTitular === false);

    return matchSearch && matchGrupo && matchRh && matchDonante;
  });

  // Paginar la lista filtrada
  const totalPages = Math.ceil(licenciasFiltradas.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const licenciasPaginadas = licenciasFiltradas.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Formato de Fechas a DD/MM/AAAA
  const formatFecha = (dateStr: string) => {
    if (!dateStr) return "-";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Botón Volver (oculto en impresión) */}
      <div className="print:hidden">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Panel Central
        </Link>
      </div>

      {/* Membrete de impresión oficial */}
      <div className="hidden print:block border-b-2 border-slate-300 pb-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 uppercase">
              Municipalidad de Santa Fe
            </h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              Reporte Oficial de Licencias de Conducir Expiradas
            </p>
          </div>
          <div className="text-right text-xs text-slate-500 leading-relaxed">
            <p>
              <span className="font-bold">Fecha del Reporte:</span>{" "}
              {new Date().toLocaleDateString("es-AR")}
            </p>
            <p>
              <span className="font-bold">Operador Responsable:</span>{" "}
              {usuario ? `${usuario.nombre} ${usuario.apellido}` : "Sistema"}
            </p>
            <p>
              <span className="font-bold">Filtros Aplicados:</span>{" "}
              {searchTextApplied ? `Texto: "${searchTextApplied}"` : ""}
              {grupoSanguineoApplied !== "TODOS" ? ` | Sangre: ${grupoSanguineoApplied}` : ""}
              {factorRhApplied !== "TODOS" ? ` | Factor: ${factorRhApplied}` : ""}
              {donanteApplied !== "TODOS" ? ` | Donante: ${donanteApplied}` : ""}
              {!searchTextApplied && grupoSanguineoApplied === "TODOS" && factorRhApplied === "TODOS" && donanteApplied === "TODOS"
                ? "Ninguno (Todas)"
                : ""}
            </p>
            <p>
              <span className="font-bold">Total Registros:</span>{" "}
              {licenciasFiltradas.length}
            </p>
          </div>
        </div>
      </div>

      {/* Tarjeta Principal */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm print:bg-transparent print:border-none print:shadow-none print:p-0">
        
        {/* Cabecera de la sección (oculto en impresión) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
          <div className="flex items-center gap-4 text-rose-400">
            <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
              <FileClock className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">
                Licencias Expiradas
              </h1>
              <p className="text-sm text-slate-400">
                Consulta y control de conductores con credenciales vencidas
              </p>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            disabled={loading || licenciasFiltradas.length === 0}
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer className="w-4 h-4" />
            Exportar PDF / Imprimir
          </button>
        </div>

        {/* Panel de Filtros (oculto en impresión) */}
        <form onSubmit={handleSearchSubmit} className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-5 space-y-4 print:hidden">
          <div className="flex items-center gap-2 text-slate-300 text-sm font-semibold">
            <Search className="w-4 h-4 text-indigo-400" />
            <span>Filtros de Búsqueda</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Filtro por Texto */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Buscar por Nombre, Apellido o DNI
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Ej: Juan Perez o 39111222"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Selector de Grupo Sanguíneo */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Grupo Sanguíneo
              </label>
              <select
                value={grupoSanguineo}
                onChange={(e) => setGrupoSanguineo(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="TODOS">Todos los grupos</option>
                <option value="A">Grupo A</option>
                <option value="B">Grupo B</option>
                <option value="AB">Grupo AB</option>
                <option value="O">Grupo O</option>
              </select>
            </div>

            {/* Selector de Factor RH */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Factor RH
              </label>
              <select
                value={factorRh}
                onChange={(e) => setFactorRh(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="TODOS">Todos los factores</option>
                <option value="+">Factor Positivo (+)</option>
                <option value="-">Factor Negativo (-)</option>
              </select>
            </div>

            {/* Selector de Donante */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Donante de Órganos
              </label>
              <select
                value={donante}
                onChange={(e) => setDonante(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="TODOS">Donantes / No Donantes</option>
                <option value="SI">Únicamente Donantes</option>
                <option value="NO">Únicamente No Donantes</option>
              </select>
            </div>

            {/* Botón Buscar */}
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 active:scale-[0.98] transition-all"
              >
                <Search className="w-4 h-4" />
                Buscar
              </button>
            </div>

            {/* Botón Limpiar */}
            <div className="flex items-end md:col-span-2">
              <button
                type="button"
                onClick={limpiarFiltros}
                className="w-full bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors duration-200"
              >
                <X className="w-4 h-4" />
                Limpiar Filtros
              </button>
            </div>
          </div>
        </form>

        {/* Resultados del Listado */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            <span className="text-sm text-slate-400 font-medium">
              Obteniendo licencias expiradas...
            </span>
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center space-y-2">
            <span className="text-rose-400 font-bold block">Error al cargar datos</span>
            <p className="text-sm text-rose-300">{error}</p>
            <button
              onClick={cargarLicencias}
              className="mt-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:underline"
            >
              Reintentar carga
            </button>
          </div>
        ) : licenciasFiltradas.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-slate-800 rounded-xl space-y-2">
            <FileClock className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="font-bold text-slate-300">
              No se encontraron licencias
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              No hay licencias expiradas cargadas en la base de datos o ninguna coincide con los filtros aplicados.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Tabla Listado - Versión Pantalla */}
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/20 print:hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="px-5 py-3.5 w-16">ID</th>
                    <th className="px-5 py-3.5">Conductor</th>
                    <th className="px-5 py-3.5">Documento</th>
                    <th className="px-5 py-3.5 text-center">Clase</th>
                    <th className="px-5 py-3.5">F. Inicio</th>
                    <th className="px-5 py-3.5">F. Vencimiento</th>
                    <th className="px-5 py-3.5 text-center">Grupo/Factor</th>
                    <th className="px-5 py-3.5 text-center">Donante</th>
                    <th className="px-5 py-3.5">Estado</th>
                    <th className="px-5 py-3.5">Observaciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm text-slate-300">
                  {licenciasPaginadas.map((lic) => (
                    <tr
                      key={lic.id}
                      className="hover:bg-slate-950/20 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-bold text-slate-400">
                        #{lic.id}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-200">
                        {lic.apellidoTitular}, {lic.nombreTitular}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-400">
                        {lic.tipoDocumentoTitular || "DNI"} {lic.numeroDocumentoTitular}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold">
                          Clase {lic.clase}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400">
                        {formatFecha(lic.fechaInicio)}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-rose-400">
                        {formatFecha(lic.fechaVencimiento)}
                      </td>
                      <td className="px-5 py-3.5 text-center font-bold text-slate-300">
                        {lic.grupoSanguineoTitular} {lic.factorRhTitular}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {lic.donanteOrganosTitular ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                            Sí
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-500 text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          {lic.estado}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-400 italic max-w-xs truncate" title={lic.observaciones}>
                        {lic.observaciones || "Sin observaciones"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tabla Listado - Versión Impresión (Muestra todo, no paginado) */}
            <div className="hidden print:block overflow-hidden rounded-xl border border-slate-300 bg-transparent">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 text-xs font-bold uppercase tracking-wider">
                    <th className="px-4 py-2.5 w-16">ID</th>
                    <th className="px-4 py-2.5">Conductor</th>
                    <th className="px-4 py-2.5">Documento</th>
                    <th className="px-4 py-2.5 text-center">Clase</th>
                    <th className="px-4 py-2.5">F. Inicio</th>
                    <th className="px-4 py-2.5">F. Vencimiento</th>
                    <th className="px-4 py-2.5 text-center">Sangre</th>
                    <th className="px-4 py-2.5 text-center">Donante</th>
                    <th className="px-4 py-2.5">Observaciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 text-xs text-slate-800">
                  {licenciasFiltradas.map((lic) => (
                    <tr key={lic.id} className="bg-transparent">
                      <td className="px-4 py-2.5 font-bold text-slate-500">
                        #{lic.id}
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-slate-900">
                        {lic.apellidoTitular}, {lic.nombreTitular}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600">
                        {lic.tipoDocumentoTitular || "DNI"} {lic.numeroDocumentoTitular}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="inline-block px-2 py-0.5 rounded border border-slate-300 text-xs font-bold bg-slate-50">
                          {lic.clase}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600">
                        {formatFecha(lic.fechaInicio)}
                      </td>
                      <td className="px-4 py-2.5 font-bold text-rose-700">
                        {formatFecha(lic.fechaVencimiento)}
                      </td>
                      <td className="px-4 py-2.5 text-center font-semibold">
                        {lic.grupoSanguineoTitular} {lic.factorRhTitular}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {lic.donanteOrganosTitular ? "SÍ" : "NO"}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 italic">
                        {lic.observaciones || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginador (oculto en impresión) */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-800/80 print:hidden">
                <span className="text-xs text-slate-500 font-medium">
                  Mostrando registros {startIndex + 1} a{" "}
                  {Math.min(startIndex + ITEMS_PER_PAGE, licenciasFiltradas.length)} de{" "}
                  {licenciasFiltradas.length}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-40 disabled:hover:bg-slate-900 disabled:hover:text-slate-400"
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
                            ? "bg-indigo-600 text-white shadow-md"
                            : "border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-40 disabled:hover:bg-slate-900 disabled:hover:text-slate-400"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
