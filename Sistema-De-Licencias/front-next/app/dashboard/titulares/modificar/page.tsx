"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, UserCog, CheckCircle, AlertCircle, Loader2, Search, X, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth, API_BASE_URL } from "@/src/context/AuthContext";

interface Titular {
  id: number;
  tipoDocumento: string;
  numeroDocumento: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string; // YYYY-MM-DD
  direccion: string;
  grupoSanguineo: string;
  factorRh: string;
  donanteOrganos: boolean;
}

interface FormErrors {
  nombre?: string;
  apellido?: string;
  direccion?: string;
  tipoDocumento?: string;
  numeroDocumento?: string;
  fechaNacimiento?: string;
  grupoSanguineo?: string;
  factorRh?: string;
}

export default function ModificarTitularPage() {
  const { usuario } = useAuth();

  // State
  const [titulares, setTitulares] = useState<Titular[]>([]);
  const [selectedTitular, setSelectedTitular] = useState<Titular | null>(null);

  // Search Filter Pending Inputs
  const [tipoDocInput, setTipoDocInput] = useState("TODOS");
  const [numDocInput, setNumDocInput] = useState("");
  const [apellidoInput, setApellidoInput] = useState("");
  const [nombreInput, setNombreInput] = useState("");
  const [fechaNacInput, setFechaNacInput] = useState("");
  const [direccionInput, setDireccionInput] = useState("");
  const [grupoSangInput, setGrupoSangInput] = useState("TODOS");
  const [factorRhInput, setFactorRhInput] = useState("TODOS");
  const [donanteInput, setDonanteInput] = useState("TODOS");

  // Search Filter Applied Values
  const [tipoDocSearch, setTipoDocSearch] = useState("TODOS");
  const [numDocSearch, setNumDocSearch] = useState("");
  const [apellidoSearch, setApellidoSearch] = useState("");
  const [nombreSearch, setNombreSearch] = useState("");
  const [fechaNacSearch, setFechaNacSearch] = useState("");
  const [direccionSearch, setDireccionSearch] = useState("");
  const [grupoSangSearch, setGrupoSangSearch] = useState("TODOS");
  const [factorRhSearch, setFactorRhSearch] = useState("TODOS");
  const [donanteSearch, setDonanteSearch] = useState("TODOS");

  // Edit Form Values
  const [editNombre, setEditNombre] = useState("");
  const [editApellido, setEditApellido] = useState("");
  const [editDireccion, setEditDireccion] = useState("");
  const [editTipoDoc, setEditTipoDoc] = useState("DNI");
  const [editNumDoc, setEditNumDoc] = useState("");
  const [editFechaNac, setEditFechaNac] = useState("");
  const [editGrupoSang, setEditGrupoSang] = useState("A");
  const [editFactorRh, setEditFactorRh] = useState("+");
  const [editDonante, setEditDonante] = useState(false);

  // Status
  const [loadingList, setLoadingList] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchErrorMsg, setSearchErrorMsg] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Fetch all holders
  const fetchTitulares = async () => {
    setLoadingList(true);
    setSearchErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE_URL}/titulares`, {
        method: "GET"
      });
      if (!res.ok) {
        throw new Error("No se pudo cargar la lista de titulares.");
      }
      const data = await res.json();
      setTitulares(data);
    } catch (err: any) {
      setSearchErrorMsg(err.message || "Error al conectar con el servidor.");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchTitulares();
  }, []);

  // Manejar el submit de la búsqueda
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
  };

  // Limpiar filtros de búsqueda
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
  };

  // Filtrado local
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

  // Paginar la lista filtrada
  const totalPages = Math.ceil(titularesFiltrados.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const titularesPaginados = titularesFiltrados.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Seleccionar titular para editar
  const handleSelectTitular = (t: Titular) => {
    setSuccessMsg(null);
    setErrorMsg(null);
    setErrors({});
    
    setSelectedTitular(t);
    setEditNombre(t.nombre);
    setEditApellido(t.apellido);
    setEditDireccion(t.direccion);
    setEditTipoDoc(t.tipoDocumento);
    setEditNumDoc(t.numeroDocumento);
    setEditFechaNac(t.fechaNacimiento);
    setEditGrupoSang(t.grupoSanguineo);
    setEditFactorRh(t.factorRh);
    setEditDonante(t.donanteOrganos);
  };

  const handleCancelEdit = () => {
    setSelectedTitular(null);
    setErrors({});
  };

  // Calcular edad
  const calcularEdad = (fechaNacStr: string) => {
    if (!fechaNacStr) return 0;
    const nac = new Date(fechaNacStr);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) {
      edad--;
    }
    return edad;
  };

  const validateForm = () => {
    const e: FormErrors = {};
    if (!editNombre.trim()) e.nombre = "El nombre es obligatorio";
    if (!editApellido.trim()) e.apellido = "El apellido es obligatorio";
    if (!editDireccion.trim()) e.direccion = "La dirección es obligatoria";
    if (!editTipoDoc) e.tipoDocumento = "Seleccione el tipo de documento";
    if (!editNumDoc.trim()) {
      e.numeroDocumento = "El número de documento es obligatorio";
    } else if (!/^\d+$/.test(editNumDoc.trim())) {
      e.numeroDocumento = "El documento debe contener sólo números";
    }
    if (!editFechaNac) {
      e.fechaNacimiento = "La fecha de nacimiento es obligatoria";
    } else {
      const edad = calcularEdad(editFechaNac);
      if (edad < 16) {
        e.fechaNacimiento = `El titular debe tener al menos 16 años (Edad actual: ${edad} años)`;
      }
    }
    if (!editGrupoSang) e.grupoSanguineo = "Seleccione el grupo sanguíneo";
    if (!editFactorRh) e.factorRh = "Seleccione el factor RH";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTitular) return;

    setSuccessMsg(null);
    setErrorMsg(null);

    // Comprobar si hubo cambios reales
    const hasChanges = 
      editNombre.trim() !== selectedTitular.nombre ||
      editApellido.trim() !== selectedTitular.apellido ||
      editDireccion.trim() !== selectedTitular.direccion ||
      editGrupoSang !== selectedTitular.grupoSanguineo ||
      editFactorRh !== selectedTitular.factorRh ||
      editDonante !== selectedTitular.donanteOrganos ||
      editTipoDoc !== selectedTitular.tipoDocumento ||
      editNumDoc.trim() !== selectedTitular.numeroDocumento ||
      editFechaNac !== selectedTitular.fechaNacimiento;

    if (!hasChanges) {
      handleCancelEdit();
      return;
    }

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoadingSubmit(true);
    try {
      const res = await fetch(`${API_BASE_URL}/titulares/${selectedTitular.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nombre: editNombre.trim(),
          apellido: editApellido.trim(),
          direccion: editDireccion.trim(),
          grupoSanguineo: editGrupoSang,
          factorRh: editFactorRh,
          donanteOrganos: editDonante,
          tipoDocumento: editTipoDoc,
          numeroDocumento: editNumDoc.trim(),
          fechaNacimiento: editFechaNac
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.details || data.error || `Error ${res.status}: No se pudo modificar el titular.`);
      }

      const updated = await res.json();
      setSuccessMsg(`Titular ${updated.apellido}, ${updated.nombre} modificado correctamente.`);
      setErrors({});
      // Refresh list
      await fetchTitulares();
      
      // Keep selected updated
      setSelectedTitular(updated);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error al modificar titular.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  const inputClass = (hasError?: string) =>
    `w-full bg-slate-950 border ${hasError ? "border-rose-500/60" : "border-slate-800"
    } rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600
     focus:outline-none focus:border-indigo-500 transition-all duration-150`;

  const selectClass = (hasError?: string) =>
    `w-full bg-slate-950 border ${hasError ? "border-rose-500/60" : "border-slate-800"
    } rounded-xl px-4 py-2.5 text-sm text-slate-200
     focus:outline-none focus:border-indigo-500 transition-all duration-150 cursor-pointer`;

  return (
    <div className="max-w-5xl space-y-6 pb-16">
      {/* Breadcrumb */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors duration-200"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al Panel Central
      </Link>

      {/* Page Header */}
      <div className="flex items-center gap-4 text-indigo-450">
        <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
          <UserCog className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Modificar Titular</h1>
          <p className="text-sm text-slate-400">
            Busca y selecciona un titular registrado para actualizar sus datos de filiación o médicos
          </p>
        </div>
      </div>

      {/* Feedback messages for list */}
      {searchErrorMsg && (
        <div className="flex items-start gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm font-semibold">{searchErrorMsg}</span>
        </div>
      )}

      {/* Panel de Búsqueda */}
      <form onSubmit={handleSearchSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 text-slate-350 text-sm font-bold border-b border-slate-800 pb-3 uppercase tracking-wide">
          <Search className="w-4 h-4 text-indigo-450" />
          <span>Filtros de Búsqueda de Titulares</span>
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
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
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
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-1.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
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
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-1.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
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
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-1.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
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
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
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
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-1.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
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
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
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
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="TODOS">Todos</option>
              <option value="+">+</option>
              <option value="-">-</option>
            </select>
          </div>

          {/* Donante */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Donante de Órganos
            </label>
            <select
              value={donanteInput}
              onChange={(e) => setDonanteInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="TODOS">Todos</option>
              <option value="SI">Donantes</option>
              <option value="NO">No donantes</option>
            </select>
          </div>

          {/* Botones de acción */}
          <div className="sm:col-span-2 md:col-span-3 flex justify-end items-end gap-3">
            <button
              type="button"
              onClick={limpiarFiltros}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-450 border border-slate-800 bg-slate-950 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            >
              <X className="w-3.5 h-3.5 inline mr-1" />
              Limpiar Filtros
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/10 active:scale-[0.98] transition-all"
            >
              <Search className="w-3.5 h-3.5" />
              Buscar Titulares
            </button>
          </div>
        </div>
      </form>

      {/* Resultados */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest border-b border-slate-800 pb-3">
          Resultados de Búsqueda ({titularesFiltrados.length})
        </h2>

        {loadingList ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <span className="text-sm text-slate-400 font-medium">Obteniendo lista de titulares...</span>
          </div>
        ) : titularesFiltrados.length === 0 ? (
          <div className="py-10 text-center border border-dashed border-slate-850 rounded-xl space-y-1">
            <UserCog className="w-8 h-8 text-slate-650 mx-auto" />
            <p className="text-sm font-bold text-slate-350">No se encontraron titulares</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Prueba modificando los filtros de búsqueda anteriores.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/20">
              <table className="w-full text-left border-collapse min-w-[700px]">
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
                    const isSelected = selectedTitular?.id === t.id;
                    return (
                      <tr
                        key={t.id}
                        className={`transition-colors hover:bg-slate-950/30 ${
                          isSelected ? "bg-indigo-500/10 border-l-2 border-indigo-500" : ""
                        }`}
                      >
                        <td className="px-5 py-3 font-semibold text-slate-200">
                          {t.tipoDocumento} {t.numeroDocumento}
                        </td>
                        <td className="px-5 py-3 font-medium text-slate-300">
                          {t.apellido}, {t.nombre}
                        </td>
                        <td className="px-5 py-3 text-slate-400">{t.fechaNacimiento}</td>
                        <td className="px-5 py-3">
                          <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                            {t.grupoSanguineo}{t.factorRh}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          {t.donanteOrganos ? (
                            <span className="text-xs font-bold text-emerald-450 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              Sí
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-slate-500 bg-slate-800 px-2 py-0.5 rounded border border-slate-750">
                              No
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <button
                            onClick={() => handleSelectTitular(t)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/20 hover:border-transparent transition-all duration-150"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            Modificar
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
                            ? "bg-indigo-600 text-white shadow-md"
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
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Formulario de Edición */}
      {selectedTitular && (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest border-b border-slate-800 pb-3">
              Editar Datos del Titular: {selectedTitular.apellido}, {selectedTitular.nombre}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {/* Tipo Documento */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Tipo de Documento <span className="text-rose-400 ml-0.5">*</span>
                </label>
                <select
                  value={editTipoDoc}
                  onChange={(e) => setEditTipoDoc(e.target.value)}
                  className={selectClass(errors.tipoDocumento)}
                >
                  <option value="DNI">DNI</option>
                  <option value="LC">LC</option>
                  <option value="LE">LE</option>
                  <option value="PASAPORTE">PASAPORTE</option>
                </select>
                {errors.tipoDocumento && (
                  <span className="text-xs text-rose-400 flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.tipoDocumento}
                  </span>
                )}
              </div>

              {/* Nro Documento */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Número de Documento <span className="text-rose-400 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  value={editNumDoc}
                  onChange={(e) => setEditNumDoc(e.target.value)}
                  className={inputClass(errors.numeroDocumento)}
                />
                {errors.numeroDocumento && (
                  <span className="text-xs text-rose-400 flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.numeroDocumento}
                  </span>
                )}
              </div>

              {/* Fecha Nacimiento */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Fecha de Nacimiento <span className="text-rose-400 ml-0.5">*</span>
                </label>
                <input
                  type="date"
                  value={editFechaNac}
                  onChange={(e) => setEditFechaNac(e.target.value)}
                  className={inputClass(errors.fechaNacimiento)}
                />
                {errors.fechaNacimiento && (
                  <span className="text-xs text-rose-400 flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.fechaNacimiento}
                  </span>
                )}
              </div>

              {/* Nombre */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Nombre <span className="text-rose-400 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  className={inputClass(errors.nombre)}
                />
                {errors.nombre && (
                  <span className="text-xs text-rose-400 flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.nombre}
                  </span>
                )}
              </div>

              {/* Apellido */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Apellido <span className="text-rose-400 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  value={editApellido}
                  onChange={(e) => setEditApellido(e.target.value)}
                  className={inputClass(errors.apellido)}
                />
                {errors.apellido && (
                  <span className="text-xs text-rose-400 flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.apellido}
                  </span>
                )}
              </div>

              {/* Dirección */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Dirección <span className="text-rose-400 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  value={editDireccion}
                  onChange={(e) => setEditDireccion(e.target.value)}
                  className={inputClass(errors.direccion)}
                />
                {errors.direccion && (
                  <span className="text-xs text-rose-400 flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.direccion}
                  </span>
                )}
              </div>

              {/* Grupo Sanguineo */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Grupo Sanguíneo <span className="text-rose-400 ml-0.5">*</span>
                </label>
                <select
                  value={editGrupoSang}
                  onChange={(e) => setEditGrupoSang(e.target.value)}
                  className={selectClass(errors.grupoSanguineo)}
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="O">O</option>
                </select>
                {errors.grupoSanguineo && (
                  <span className="text-xs text-rose-400 flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.grupoSanguineo}
                  </span>
                )}
              </div>

              {/* Factor Rh */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Factor RH <span className="text-rose-400 ml-0.5">*</span>
                </label>
                <select
                  value={editFactorRh}
                  onChange={(e) => setEditFactorRh(e.target.value)}
                  className={selectClass(errors.factorRh)}
                >
                  <option value="+">+</option>
                  <option value="-">-</option>
                </select>
                {errors.factorRh && (
                  <span className="text-xs text-rose-450 flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.factorRh}
                  </span>
                )}
              </div>

              {/* Donante */}
              <div className="flex items-center gap-3 mt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editDonante}
                    onChange={(e) => setEditDonante(e.target.checked)}
                    className="w-4.5 h-4.5 bg-slate-950 border border-slate-800 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-200">Donante de Órganos</span>
                    <p className="text-[11px] text-slate-500">Manifestación expresa de voluntad</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Feedback messages for editing */}
          {successMsg && (
            <div className="flex items-start gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 mb-4">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm font-semibold">{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="flex items-start gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 mb-4">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm font-semibold">{errorMsg}</span>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loadingSubmit}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/10 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loadingSubmit ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando cambios...
                </>
              ) : (
                <>
                  <UserCog className="w-4 h-4" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
