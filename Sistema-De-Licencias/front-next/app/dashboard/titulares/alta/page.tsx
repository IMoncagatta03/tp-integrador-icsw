"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, UserPlus, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/src/context/AuthContext";

const TIPOS_DOCUMENTO = ["DNI", "LC", "LE", "PASAPORTE"];
const GRUPOS_SANGUINEOS = ["A", "B", "AB", "O"] as const;
const FACTORES_RH = ["+", "-"] as const;

interface FormData {
  tipoDocumento: string;
  numeroDocumento: string;
  apellido: string;
  nombre: string;
  fechaNacimiento: string;
  direccion: string;
  grupoSanguineo: string;
  factorRh: string;
  donanteOrganos: boolean;
}

interface FormErrors {
  tipoDocumento?: string;
  numeroDocumento?: string;
  apellido?: string;
  nombre?: string;
  fechaNacimiento?: string;
  direccion?: string;
  grupoSanguineo?: string;
  factorRh?: string;
}

const initialForm: FormData = {
  tipoDocumento: "",
  numeroDocumento: "",
  apellido: "",
  nombre: "",
  fechaNacimiento: "",
  direccion: "",
  grupoSanguineo: "",
  factorRh: "",
  donanteOrganos: false,
};

function validate(form: FormData): FormErrors {
  const e: FormErrors = {};
  if (!form.tipoDocumento) e.tipoDocumento = "Seleccioná el tipo de documento";
  if (!form.numeroDocumento.trim()) e.numeroDocumento = "El número de documento es obligatorio";
  else if (!/^[a-zA-Z0-9]+$/.test(form.numeroDocumento)) e.numeroDocumento = "Solo letras y números";
  if (!form.apellido.trim()) e.apellido = "El apellido es obligatorio";
  if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio";
  if (!form.fechaNacimiento) e.fechaNacimiento = "La fecha de nacimiento es obligatoria";
  if (!form.direccion.trim()) e.direccion = "La dirección es obligatoria";
  if (!form.grupoSanguineo) e.grupoSanguineo = "Seleccioná el grupo sanguíneo";
  if (!form.factorRh) e.factorRh = "Seleccioná el factor RH";
  return e;
}

// Campo de formulario reutilizable
function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
        {label}
        {required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <span className="flex items-center gap-1 text-xs text-rose-400 font-medium">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {error}
        </span>
      )}
    </div>
  );
}

// Estilos reutilizables
const inputClass = (hasError?: string) =>
  `w-full bg-slate-950 border ${hasError ? "border-rose-500/60" : "border-slate-800"
  } rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600
   focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20
   transition-colors duration-150`;

const selectClass = (hasError?: string) =>
  `w-full bg-slate-950 border ${hasError ? "border-rose-500/60" : "border-slate-800"
  } rounded-lg px-3 py-2.5 text-sm text-slate-200
   focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20
   transition-colors duration-150 cursor-pointer appearance-none`;

export default function AltaTitularPage() {
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
      const payload = {
        ...form,
        fechaNacimiento: form.fechaNacimiento, // yyyy-MM-dd
      };

      const res = await fetch(`${API_BASE_URL}/titulares`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Error ${res.status}: No se pudo registrar el titular.`);
      }

      const data = await res.json();
      setSuccessMsg(`Titular registrado exitosamente (ID: ${data.id}).`);
      setForm(initialForm);
      setErrors({});
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setLoading(false);
    }
  };

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
      <div className="flex items-center gap-4 text-emerald-400">
        <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
          <UserPlus className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Dar de Alta Titular</h1>
          <p className="text-sm text-slate-400">
            Registrar un nuevo titular en el sistema de licencias
          </p>
        </div>
      </div>

      {/* Feedback */}
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

        {/* Card: Datos del Documento */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest">
              Documento de Identidad
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Tipo de Documento" required error={errors.tipoDocumento}>
              <select
                name="tipoDocumento"
                value={form.tipoDocumento}
                onChange={handleChange}
                className={selectClass(errors.tipoDocumento)}
              >
                <option value="">Seleccionar...</option>
                {TIPOS_DOCUMENTO.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>

            <Field label="Número de Documento" required error={errors.numeroDocumento}>
              <input
                type="text"
                name="numeroDocumento"
                value={form.numeroDocumento}
                onChange={handleChange}
                placeholder="Ej: 35123456"
                className={inputClass(errors.numeroDocumento)}
              />
            </Field>
          </div>
        </div>

        {/* Card: Datos Personales */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest">
              Datos Personales
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Apellido" required error={errors.apellido}>
              <input
                type="text"
                name="apellido"
                value={form.apellido}
                onChange={handleChange}
                placeholder="Ej: Pérez"
                className={inputClass(errors.apellido)}
              />
            </Field>

            <Field label="Nombre" required error={errors.nombre}>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Ej: Juan"
                className={inputClass(errors.nombre)}
              />
            </Field>

            <Field label="Fecha de Nacimiento" required error={errors.fechaNacimiento}>
              <input
                type="date"
                name="fechaNacimiento"
                value={form.fechaNacimiento}
                onChange={handleChange}
                className={inputClass(errors.fechaNacimiento)}
              />
            </Field>

            <div className="sm:col-span-2">
              <Field label="Dirección" required error={errors.direccion}>
                <input
                  type="text"
                  name="direccion"
                  value={form.direccion}
                  onChange={handleChange}
                  placeholder="Ej: Av. San Martín 1234, Santa Fe"
                  className={inputClass(errors.direccion)}
                />
              </Field>
            </div>
          </div>
        </div>

        {/* Card: Datos Médicos */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest">
              Datos Médicos
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Grupo Sanguíneo" required error={errors.grupoSanguineo}>
              <div className="flex gap-2 flex-wrap">
                {GRUPOS_SANGUINEOS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, grupoSanguineo: g }));
                      setErrors((prev) => ({ ...prev, grupoSanguineo: undefined }));
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all duration-150 ${
                      form.grupoSanguineo === g
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/10"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
              {errors.grupoSanguineo && (
                <span className="flex items-center gap-1 text-xs text-rose-400 font-medium mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.grupoSanguineo}
                </span>
              )}
            </Field>

            <Field label="Factor RH" required error={errors.factorRh}>
              <div className="flex gap-2">
                {FACTORES_RH.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, factorRh: f }));
                      setErrors((prev) => ({ ...prev, factorRh: undefined }));
                    }}
                    className={`px-6 py-2 rounded-lg text-sm font-bold border transition-all duration-150 ${
                      form.factorRh === f
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/10"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                    }`}
                  >
                    {f === "+" ? "RH Positivo (+)" : "RH Negativo (−)"}
                  </button>
                ))}
              </div>
              {errors.factorRh && (
                <span className="flex items-center gap-1 text-xs text-rose-400 font-medium mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.factorRh}
                </span>
              )}
            </Field>

            <div className="sm:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="donanteOrganos"
                    checked={form.donanteOrganos}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className={`w-10 h-5 rounded-full border transition-colors duration-200 
                    ${form.donanteOrganos
                      ? "bg-indigo-600 border-indigo-500"
                      : "bg-slate-800 border-slate-700"}`}>
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200
                      ${form.donanteOrganos ? "translate-x-5" : "translate-x-0"}`} />
                  </div>
                </div>
                <div>
                  <span className="text-sm font-semibold text-slate-200">Donante de Órganos</span>
                  <p className="text-xs text-slate-500">El titular consiente la donación de órganos</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
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
                Registrar Titular
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
