"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, UserPlus, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useAuth, API_BASE_URL } from "@/src/context/AuthContext";

interface FormData {
  username: string;
  password: string;
  nombre: string;
  apellido: string;
  rol: string;
  activo: boolean;
}

interface FormErrors {
  username?: string;
  password?: string;
  nombre?: string;
  apellido?: string;
  rol?: string;
}

const initialForm: FormData = {
  username: "",
  password: "",
  nombre: "",
  apellido: "",
  rol: "ADMINISTRATIVO",
  activo: true,
};

function validate(form: FormData): FormErrors {
  const e: FormErrors = {};
  if (!form.username.trim()) e.username = "El nombre de usuario es obligatorio";
  if (!form.password.trim()) e.password = "La contraseña es obligatoria";
  else if (form.password.length < 4) e.password = "Debe tener al menos 4 caracteres";
  if (!form.apellido.trim()) e.apellido = "El apellido es obligatorio";
  if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio";
  if (!form.rol) e.rol = "Seleccione un rol";
  return e;
}

export default function AltaUsuarioPage() {
  const { usuario } = useAuth();
  const isAdministrativo = usuario?.rol === "ADMINISTRATIVO";

  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/usuarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Usuario-Operador-Id": usuario?.id ? usuario.id.toString() : "1"
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.details || data.error || `Error ${res.status}: No se pudo crear el usuario.`);
      }

      const data = await res.json();
      setSuccessMsg(`Usuario ${data.username} registrado exitosamente.`);
      setForm(initialForm);
      setErrors({});
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setLoading(false);
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
    <div className="max-w-3xl space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors duration-200"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al Panel Central
      </Link>

      {/* Page Header */}
      <div className="flex items-center gap-4 text-indigo-400">
        <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
          <UserPlus className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Dar de Alta Usuario</h1>
          <p className="text-sm text-slate-400">
            Registrar un nuevo operador en el sistema de licencias municipal
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

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest border-b border-slate-800 pb-3">
            Datos de Cuenta e Identidad
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Nombre de Usuario <span className="text-rose-400 ml-0.5">*</span>
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Ej: jgomez"
                className={inputClass(errors.username)}
              />
              {errors.username && (
                <span className="text-xs text-rose-400 flex items-center gap-1 mt-0.5">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.username}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Contraseña <span className="text-rose-400 ml-0.5">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Mínimo 4 caracteres"
                className={inputClass(errors.password)}
              />
              {errors.password && (
                <span className="text-xs text-rose-400 flex items-center gap-1 mt-0.5">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.password}
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
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Ej: Juan"
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
                name="apellido"
                value={form.apellido}
                onChange={handleChange}
                placeholder="Ej: Gomez"
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
                name="rol"
                value={form.rol}
                onChange={handleChange}
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

            {/* Espacio reservado para alineación */}
            <div className="hidden sm:block"></div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/10 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Registrando...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Crear Usuario
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
