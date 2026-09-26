"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, UserCog, CheckCircle, AlertCircle, Loader2, Search, X, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth, API_BASE_URL } from "@/src/context/AuthContext";

interface Usuario {
  id: number;
  username: string;
  nombre: string;
  apellido: string;
  rol: "ADMINISTRATIVO" | "ADMINISTRADOR";
  activo: boolean;
}

interface FormErrors {
  nombre?: string;
  apellido?: string;
  rol?: string;
}

export default function ModificarUsuarioPage() {
  const { usuario } = useAuth();
  const isAdministrativo = usuario?.rol === "ADMINISTRATIVO";

  // State
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);

  // Search Filter Pending Inputs
  const [usernameInput, setUsernameInput] = useState("");
  const [nombreInput, setNombreInput] = useState("");
  const [apellidoInput, setApellidoInput] = useState("");
  const [rolInput, setRolInput] = useState("TODOS");
  const [activoInput, setActivoInput] = useState("TODOS");

  // Search Filter Applied Values
  const [usernameSearch, setUsernameSearch] = useState("");
  const [nombreSearch, setNombreSearch] = useState("");
  const [apellidoSearch, setApellidoSearch] = useState("");
  const [rolSearch, setRolSearch] = useState("TODOS");
  const [activoSearch, setActivoSearch] = useState("TODOS");
  
  // Edit Form Values
  const [editPassword, setEditPassword] = useState("");
  const [editNombre, setEditNombre] = useState("");
  const [editApellido, setEditApellido] = useState("");
  const [editRol, setEditRol] = useState("ADMINISTRATIVO");
  const [editActivo, setEditActivo] = useState(true);

  // Status
  const [loadingList, setLoadingList] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pagination State for Users Table
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Fetch all users
  const fetchUsuarios = async () => {
    setLoadingList(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE_URL}/usuarios`, {
        method: "GET",
        headers: {
          "X-Usuario-Operador-Id": usuario?.id ? usuario.id.toString() : "1"
        }
      });
      if (!res.ok) {
        throw new Error("No se pudo cargar la lista de usuarios.");
      }
      const data = await res.json();
      setUsuarios(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al conectar con el servidor.");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (isAdministrativo) {
      fetchUsuarios();
    }
  }, [isAdministrativo]);

  // Manejar el submit de la búsqueda
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameSearch(usernameInput);
    setNombreSearch(nombreInput);
    setApellidoSearch(apellidoInput);
    setRolSearch(rolInput);
    setActivoSearch(activoInput);
    setCurrentPage(1);
  };

  // Limpiar filtros de búsqueda
  const limpiarFiltros = () => {
    setUsernameInput("");
    setUsernameSearch("");
    setNombreInput("");
    setNombreSearch("");
    setApellidoInput("");
    setApellidoSearch("");
    setRolInput("TODOS");
    setRolSearch("TODOS");
    setActivoInput("TODOS");
    setActivoSearch("TODOS");
    setCurrentPage(1);
  };

  // Filtrado local de usuarios
  const usuariosFiltrados = usuarios.filter((u) => {
    const matchUsername = !usernameSearch || u.username.toLowerCase().includes(usernameSearch.toLowerCase());
    const matchNombre = !nombreSearch || u.nombre.toLowerCase().includes(nombreSearch.toLowerCase());
    const matchApellido = !apellidoSearch || u.apellido.toLowerCase().includes(apellidoSearch.toLowerCase());
    const matchRol = rolSearch === "TODOS" || u.rol === rolSearch;
    const matchActivo =
      activoSearch === "TODOS" ||
      (activoSearch === "ACTIVO" && u.activo === true) ||
      (activoSearch === "INACTIVO" && u.activo === false);

    return matchUsername && matchNombre && matchApellido && matchRol && matchActivo;
  });

  // Paginar la lista filtrada
  const totalPages = Math.ceil(usuariosFiltrados.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const usuariosPaginados = usuariosFiltrados.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Seleccionar usuario para editar
  const handleSelectUser = (user: Usuario) => {
    setSuccessMsg(null);
    setErrorMsg(null);
    setErrors({});
    setEditPassword("");
    
    setSelectedUser(user);
    setEditNombre(user.nombre);
    setEditApellido(user.apellido);
    setEditRol(user.rol);
    setEditActivo(user.activo);
  };

  const handleCancelEdit = () => {
    setSelectedUser(null);
    setEditPassword("");
    setErrors({});
  };

  const validateForm = () => {
    const e: FormErrors = {};
    if (!editNombre.trim()) e.nombre = "El nombre es obligatorio";
    if (!editApellido.trim()) e.apellido = "El apellido es obligatorio";
    if (!editRol) e.rol = "Seleccione un rol";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setSuccessMsg(null);
    setErrorMsg(null);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoadingSubmit(true);
    try {
      const res = await fetch(`${API_BASE_URL}/usuarios/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Usuario-Operador-Id": usuario?.id ? usuario.id.toString() : "1"
        },
        body: JSON.stringify({
          username: selectedUser.username,
          password: editPassword.trim() ? editPassword : null,
          nombre: editNombre.trim(),
          apellido: editApellido.trim(),
          rol: editRol,
          activo: editActivo
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.details || data.error || `Error ${res.status}: No se pudo modificar el usuario.`);
      }

      const updatedUser = await res.json();
      setSuccessMsg(`Usuario ${updatedUser.username} modificado correctamente.`);
      setEditPassword("");
      setErrors({});
      // Refresh list
      await fetchUsuarios();
      
      // Update local edit form state to keep track of any updates if needed
      setSelectedUser(updatedUser);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error al modificar usuario.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  // Restricción de rol
  if (!isAdministrativo) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-100">Acceso Denegado</h2>
        <p className="text-sm text-slate-400">
          Esta funcionalidad es exclusiva para usuarios con rol de <strong>Administrativo</strong>.
        </p>
        <Link
          href="/dashboard"
          className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all"
        >
          Volver al Panel
        </Link>
      </div>
    );
  }

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
      <div className="flex items-center gap-4 text-rose-450">
        <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 text-rose-400">
          <UserCog className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Modificar Usuario</h1>
          <p className="text-sm text-slate-400">
            Busca y selecciona un usuario del sistema para actualizar sus datos o perfil
          </p>
        </div>
      </div>

      {/* Feedback messages */}
      {successMsg && (
        <div className="flex items-start gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm font-semibold">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-start gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Panel de Búsqueda de Usuarios */}
      <form onSubmit={handleSearchSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 text-slate-350 text-sm font-bold border-b border-slate-800 pb-3 uppercase tracking-wide">
          <Search className="w-4 h-4 text-indigo-450" />
          <span>Filtros de Operadores</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Username */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Nombre de Usuario
            </label>
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="Ej: jgomez"
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

          {/* Apellido */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Apellido
            </label>
            <input
              type="text"
              value={apellidoInput}
              onChange={(e) => setApellidoInput(e.target.value)}
              placeholder="Ej: Gomez"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Rol */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Rol
            </label>
            <select
              value={rolInput}
              onChange={(e) => setRolInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="TODOS">Todos los roles</option>
              <option value="ADMINISTRATIVO">Administrativo</option>
              <option value="ADMINISTRADOR">Usuario del sistema</option>
            </select>
          </div>

          {/* Activo / Inactivo */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Estado
            </label>
            <select
              value={activoInput}
              onChange={(e) => setActivoInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="ACTIVO">Activos</option>
              <option value="INACTIVO">Inactivos</option>
            </select>
          </div>

          {/* Botones de acción */}
          <div className="md:col-span-5 flex justify-end gap-3 pt-2">
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
              Buscar Operadores
            </button>
          </div>
        </div>
      </form>

      {/* Resultados de la Búsqueda */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest border-b border-slate-800 pb-3">
          Resultados de Búsqueda ({usuariosFiltrados.length})
        </h2>

        {loadingList ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <span className="text-sm text-slate-400 font-medium">Obteniendo lista de operadores...</span>
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="py-10 text-center border border-dashed border-slate-850 rounded-xl space-y-1">
            <UserCog className="w-8 h-8 text-slate-650 mx-auto" />
            <p className="text-sm font-bold text-slate-350">No se encontraron operadores</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Prueba modificando los filtros de búsqueda anteriores.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/20">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="px-5 py-3">ID</th>
                    <th className="px-5 py-3">Nombre de Usuario</th>
                    <th className="px-5 py-3">Nombre y Apellido</th>
                    <th className="px-5 py-3">Rol</th>
                    <th className="px-5 py-3 text-center">Estado</th>
                    <th className="px-5 py-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-sm text-slate-300">
                  {usuariosPaginados.map((u) => {
                    const isSelected = selectedUser?.id === u.id;
                    return (
                      <tr
                        key={u.id}
                        className={`transition-colors hover:bg-slate-950/30 ${
                          isSelected ? "bg-indigo-500/10 border-l-2 border-indigo-500" : ""
                        }`}
                      >
                        <td className="px-5 py-3 font-bold text-slate-400">#{u.id}</td>
                        <td className="px-5 py-3 font-semibold text-slate-200">{u.username}</td>
                        <td className="px-5 py-3 font-medium text-slate-300">
                          {u.apellido}, {u.nombre}
                        </td>
                        <td className="px-5 py-3">
                          {u.rol === "ADMINISTRADOR" ? (
                            <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                              Usuario del sistema
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded border border-sky-500/20">
                              Administrativo
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-center">
                          {u.activo ? (
                            <span className="inline-flex items-center text-xs font-bold text-emerald-450 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              Activo
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-xs font-semibold text-slate-500 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                              Inactivo
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <button
                            onClick={() => handleSelectUser(u)}
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
                  Mostrando operadores {startIndex + 1} a{" "}
                  {Math.min(startIndex + ITEMS_PER_PAGE, usuariosFiltrados.length)} de{" "}
                  {usuariosFiltrados.length}
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

      {/* Formulario de Edición (Visible sólo cuando se selecciona un operador) */}
      {selectedUser && (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest border-b border-slate-800 pb-3">
              Editar Datos del Operador: {selectedUser.username}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Username (Read Only) */}
              <div className="flex flex-col gap-1.5 opacity-60">
                <label className="text-xs font-semibold text-slate-450 uppercase tracking-wide">
                  Nombre de Usuario (No editable)
                </label>
                <input
                  type="text"
                  value={selectedUser.username}
                  disabled
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed font-medium"
                />
              </div>

              {/* Password (Optional) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Nueva Contraseña (Dejar vacío para conservar actual)
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Mínimo 4 caracteres si desea cambiarla"
                  className={inputClass()}
                />
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
                  placeholder="Nombre del operador"
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
                  placeholder="Apellido del operador"
                  className={inputClass(errors.apellido)}
                />
                {errors.apellido && (
                  <span className="text-xs text-rose-400 flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.apellido}
                  </span>
                )}
              </div>

              {/* Rol */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Rol del Usuario <span className="text-rose-400 ml-0.5">*</span>
                </label>
                <select
                  value={editRol}
                  onChange={(e) => setEditRol(e.target.value)}
                  className={selectClass(errors.rol)}
                >
                  <option value="ADMINISTRATIVO">Administrativo</option>
                  <option value="ADMINISTRADOR">Usuario del sistema</option>
                </select>
                {errors.rol && (
                  <span className="text-xs text-rose-400 flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.rol}
                  </span>
                )}
              </div>

              {/* Activo */}
              <div className="flex items-center gap-3 mt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editActivo}
                    onChange={(e) => setEditActivo(e.target.checked)}
                    className="w-4.5 h-4.5 bg-slate-950 border border-slate-800 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-200">Usuario Activo</span>
                    <p className="text-[11px] text-slate-500">Permitir iniciar sesión en el sistema</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

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
