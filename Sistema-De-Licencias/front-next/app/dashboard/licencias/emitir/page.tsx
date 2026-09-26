"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth, API_BASE_URL } from "@/src/context/AuthContext";
import {
  ArrowLeft,
  FilePlus,
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
  DollarSign
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

interface LicenciaEmitida {
  id: number;
  clase: string;
  fechaInicio: string;
  fechaVencimiento: string;
  observaciones: string;
  estado: string;
}

export default function EmitirLicenciaPage() {
  const { usuario } = useAuth();

  // Estados de control del flujo
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Búsqueda, 2: Formulario/Preview, 3: Éxito/Detalle
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Campos de búsqueda
  const [tipoDocumento, setTipoDocumento] = useState("DNI");
  const [numeroDocumento, setNumeroDocumento] = useState("");

  // Titular encontrado
  const [titular, setTitular] = useState<Titular | null>(null);

  // Campos de emisión
  const [claseLicencia, setClaseLicencia] = useState("B");
  const [observaciones, setObservaciones] = useState("");

  // Vigencia real calculada en backend
  const [vigenciaReal, setVigenciaReal] = useState<number | null>(null);
  const [fechaVencimientoReal, setFechaVencimientoReal] = useState<string | null>(null);

  // Efecto para buscar vigencia en tiempo real al seleccionar titular o cambiar clase
  useEffect(() => {
    const obtenerVigencia = async () => {
      if (!titular || !claseLicencia) {
        setVigenciaReal(null);
        setFechaVencimientoReal(null);
        return;
      }
      try {
        const response = await fetch(
          `${API_BASE_URL}/licencias/vigencia?titularId=${titular.id}&clase=${claseLicencia}`
        );
        if (response.ok) {
          const data = await response.json();
          setVigenciaReal(data.vigenciaAnos);
          setFechaVencimientoReal(data.fechaVencimiento);
        } else {
          setVigenciaReal(null);
          setFechaVencimientoReal(null);
        }
      } catch (err) {
        setVigenciaReal(null);
        setFechaVencimientoReal(null);
      }
    };
    obtenerVigencia();
  }, [titular, claseLicencia]);

  // Licencia y Trámite generados
  const [licenciaEmitida, setLicenciaEmitida] = useState<LicenciaEmitida | null>(null);
  const [detalleCostos, setDetalleCostos] = useState<{
    costoBase: number;
    gastosAdministrativos: number;
    costoTotal: number;
    vigenciaAnos: number;
  } | null>(null);

  // Función para buscar titular por DNI
  const buscarTitular = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numeroDocumento.trim()) return;

    setLoading(true);
    setError(null);
    setTitular(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/titulares/buscar?tipoDocumento=${tipoDocumento}&numeroDocumento=${numeroDocumento}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Titular no encontrado. Por favor, regístrelo en 'Dar de Alta Titular'.");
        }
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Error al buscar el titular.");
      }

      const data: Titular = await response.json();
      setTitular(data);
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calcular la edad a partir de la fecha de nacimiento
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

  // Validaciones del Frontend basadas en reglas de negocio
  const esProfesional = ["C", "D", "E"].includes(claseLicencia);
  const cumpleRestriccionEdad = () => {
    if (!titular) return true;
    if (esProfesional && edadTitular < 21) return false;
    if (!esProfesional && edadTitular < 17) return false;
    return true;
  };

  // Calcular vigencia teórica (Front)
  const calcularVigenciaTeorica = () => {
    if (vigenciaReal !== null) return vigenciaReal;
    if (!titular) return 5;
    if (edadTitular < 17) return 0;
    if (edadTitular < 21) return 1; // Se asume primera vez
    if (edadTitular >= 21 && edadTitular <= 46) return 5;
    if (edadTitular >= 47 && edadTitular <= 60) return 4;
    if (edadTitular >= 61 && edadTitular <= 70) return 3;
    return 1;
  };

  // Confirmar y emitir licencia
  const procesarEmision = async () => {
    if (!titular) return;
    if (!cumpleRestriccionEdad()) {
      setError("No se puede emitir la licencia debido a restricciones de edad.");
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        titularId: titular.id.toString(),
        clase: claseLicencia,
        observaciones: observaciones,
        usuarioId: usuario?.id ? usuario.id.toString() : "1"
      });

      const response = await fetch(`${API_BASE_URL}/licencias/emitir?${params.toString()}`, {
        method: "POST"
      });

      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(errMsg || "Error al emitir la licencia.");
      }

      const data: LicenciaEmitida = await response.json();
      setLicenciaEmitida(data);

      // Calcular vigencia de forma exacta basándonos en el retorno del backend
      const parseLocalDate = (dateStr: string) => {
        const parts = dateStr.split('-');
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      };
      const start = parseLocalDate(data.fechaInicio);
      const end = parseLocalDate(data.fechaVencimiento);
      const vigenciaAnos = end.getFullYear() - start.getFullYear();
      
      // Costos simulados para mostrar factura detallada (o podemos inferir los costos por clase y configuracion)
      let costoLicenciaBase = 15.00;
      if (claseLicencia === "A" || claseLicencia === "B" || claseLicencia === "G") {
        costoLicenciaBase = vigenciaAnos === 5 ? 40 : (vigenciaAnos === 4 ? 30 : (vigenciaAnos === 3 ? 25 : 20));
      } else if (claseLicencia === "C") {
        costoLicenciaBase = vigenciaAnos === 5 ? 47 : (vigenciaAnos === 4 ? 35 : (vigenciaAnos === 3 ? 30 : 23));
      } else if (claseLicencia === "E") {
        costoLicenciaBase = vigenciaAnos === 5 ? 59 : (vigenciaAnos === 4 ? 44 : (vigenciaAnos === 3 ? 39 : 29));
      }

      setDetalleCostos({
        costoBase: costoLicenciaBase,
        gastosAdministrativos: 8.00,
        costoTotal: costoLicenciaBase + 8.00,
        vigenciaAnos
      });

      setStep(3);
      setSuccess("Licencia emitida exitosamente en el sistema.");
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setActionLoading(false);
    }
  };

  // Reset del formulario para una nueva emisión
  const resetForm = () => {
    setStep(1);
    setTitular(null);
    setNumeroDocumento("");
    setClaseLicencia("B");
    setObservaciones("");
    setLicenciaEmitida(null);
    setDetalleCostos(null);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Botón Volver */}
      <div className="flex justify-between items-center">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Panel Central
        </Link>

        {step > 1 && (
          <button
            onClick={resetForm}
            className="text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors"
          >
            Reiniciar Formulario
          </button>
        )}
      </div>

      {/* Título Principal */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-4 text-indigo-400">
          <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <FilePlus className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Emitir Licencia de Conducir</h1>
            <p className="text-sm text-slate-400">Generar una nueva habilitación de conducción validando reglas y costos</p>
          </div>
        </div>

        {/* Alertas */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 px-4 py-3.5 rounded-xl text-rose-400 text-sm font-semibold flex items-start gap-2.5 animate-shake">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Error de Validación</p>
              <p className="text-xs text-rose-300/90 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-3.5 rounded-xl text-emerald-400 text-sm font-semibold flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5" />
            <span>{success}</span>
          </div>
        )}

        {/* PASO 1: BÚSQUEDA DEL TITULAR */}
        {step === 1 && (
          <div className="space-y-6 border-t border-slate-800/80 pt-6">
            <h2 className="text-lg font-semibold text-slate-200">Paso 1: Buscar Titular</h2>
            <p className="text-sm text-slate-400">
              Ingrese el tipo y número de documento del conductor para verificar su existencia y cargar su ficha médica.
            </p>

            <form onSubmit={buscarTitular} className="flex flex-col sm:flex-row gap-4 max-w-2xl">
              <div className="w-full sm:w-1/3">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Tipo de Documento
                </label>
                <select
                  value={tipoDocumento}
                  onChange={(e) => setTipoDocumento(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                >
                  <option value="DNI">DNI</option>
                  <option value="LE">LE</option>
                  <option value="LC">LC</option>
                  <option value="PASAPORTE">PASAPORTE</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Número de Documento
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={numeroDocumento}
                    onChange={(e) => setNumeroDocumento(e.target.value)}
                    placeholder="Ej. 42398402"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-slate-200 font-medium placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                  />
                  <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="sm:self-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      Buscar
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-4 text-xs text-slate-500 space-y-1 leading-relaxed">
              <span className="font-bold text-slate-400">¿No está registrado en el sistema?</span>
              <p>
                Si es un titular nuevo que nunca ha realizado trámites, primero debe cargarse en el panel administrativo. Puede hacerlo desde el acceso rápido{" "}
                <Link href="/dashboard/titulares/alta" className="text-indigo-400 hover:underline">
                  Dar de Alta Titular
                </Link>.
              </p>
            </div>
          </div>
        )}

        {/* PASO 2: FORMULARIO Y VISTA PREVIA DE LICENCIA */}
        {step === 2 && titular && (
          <div className="space-y-8 border-t border-slate-800/80 pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Columna Izquierda: Formulario y Ficha */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Ficha del Titular */}
                <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                    <User className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-bold text-slate-200 text-sm">Ficha del Titular</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-xs text-slate-500 block">Nombre Completo</span>
                      <span className="font-semibold text-slate-300">
                        {titular.apellido}, {titular.nombre}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Documento de Identidad</span>
                      <span className="font-semibold text-slate-300">
                        {titular.tipoDocumento} {titular.numeroDocumento}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Fecha Nacimiento (Edad)</span>
                      <span className="font-semibold text-slate-300">
                        {new Date(titular.fechaNacimiento).toLocaleDateString("es-AR")} ({edadTitular} años)
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Grupo Sanguíneo</span>
                      <span className="font-bold text-slate-300">
                        {titular.grupoSanguineo} {titular.factorRh}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-slate-500 block">Donante de Órganos</span>
                      <span className={`inline-flex items-center gap-1 text-xs font-bold mt-1 px-2.5 py-0.5 rounded-full border ${
                        titular.donanteOrganos 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}>
                        {titular.donanteOrganos ? "Sí, donante registrado" : "No donante"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Selección de Configuración */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-bold text-slate-200 text-sm">Parámetros de la Licencia</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Clase de Licencia Solicitada
                      </label>
                      <select
                        value={claseLicencia}
                        onChange={(e) => setClaseLicencia(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      >
                        <option value="A">Clase A (Motos y Ciclomotores)</option>
                        <option value="B">Clase B (Autos, Utilitarios y Acoplados Livianos)</option>
                        <option value="C">Clase C (Camiones y Acoplados)</option>
                        <option value="D">Clase D (Transporte de Pasajeros)</option>
                        <option value="E">Clase E (Camiones Articulados o Maquinaria Especial)</option>
                        <option value="G">Clase G (Tractores Agrícolas o Maquinaria Especial)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Observaciones y Limitaciones Médicas
                      </label>
                      <textarea
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                        placeholder="Ej. Uso obligatorio de lentes correctoras. Limitado a conducción diurna."
                        rows={3}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 font-medium placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                      />
                    </div>
                  </div>

                  {/* Advertencias de negocio inmediatas en UI */}
                  {esProfesional && edadTitular < 21 && (
                    <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-rose-400 text-xs font-bold flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                      <p>
                        Error de Regla: Las clases profesionales (C, D, E) requieren un mínimo de 21 años de edad. El titular actual tiene {edadTitular} años.
                      </p>
                    </div>
                  )}

                  {!esProfesional && edadTitular < 17 && (
                    <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-rose-400 text-xs font-bold flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                      <p>
                        Error de Regla: Las licencias comunes exigen un mínimo de 17 años. El titular actual tiene {edadTitular} años.
                      </p>
                    </div>
                  )}

                  {esProfesional && edadTitular > 65 && (
                    <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-amber-400 text-xs font-bold flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                      <p>
                        Advertencia: No se permite otorgar licencias profesionales por primera vez a personas mayores de 65 años. Asegúrese de que el titular tenga licencia profesional previa.
                      </p>
                    </div>
                  )}
                </div>

              </div>

              {/* Columna Derecha: Vista Previa Real-time de Licencia */}
              <div className="lg:col-span-5 flex flex-col justify-start items-center space-y-6">
                <div className="w-full text-center lg:text-left">
                  <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2 justify-center lg:justify-start">
                    <CreditCard className="w-5 h-5 text-indigo-400" />
                    Vista Previa de Licencia
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Simulación gráfica en tiempo real de la credencial física</p>
                </div>

                {/* Carnet de Conducir con Estética Premium */}
                <div className="w-full max-w-[340px] aspect-[1.586/1] rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 p-5 relative overflow-hidden shadow-2xl shadow-indigo-500/5 group hover:border-indigo-400/50 transition-all duration-300">
                  
                  {/* Patrón de líneas de fondo decorativo */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.12),rgba(255,255,255,0))]"></div>
                  
                  {/* Encabezado del Carnet */}
                  <div className="flex justify-between items-start border-b border-indigo-500/20 pb-2 relative z-10">
                    <div>
                      <span className="text-[9px] font-extrabold text-indigo-300 uppercase tracking-widest block">República Argentina</span>
                      <span className="text-[7px] text-slate-400 font-semibold tracking-wider block">LICENCIA NACIONAL DE CONDUCIR</span>
                    </div>
                    {/* Habilitación Clase */}
                    <div className="bg-indigo-600 text-white font-extrabold text-lg px-3 py-1 rounded-lg border border-indigo-400/20 shadow-md">
                      {claseLicencia}
                    </div>
                  </div>

                  {/* Cuerpo del Carnet */}
                  <div className="grid grid-cols-12 gap-3 mt-4 relative z-10">
                    
                    {/* Foto de Conductor */}
                    <div className="col-span-4 aspect-square rounded-lg bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-slate-700 relative overflow-hidden group-hover:border-indigo-500/20 transition-all">
                      <User className="w-8 h-8 text-slate-800" />
                      <span className="text-[7px] text-slate-600 mt-1 font-bold">FOTO</span>
                      <div className="absolute bottom-0 inset-x-0 bg-indigo-600/10 h-1"></div>
                    </div>

                    {/* Datos Personales */}
                    <div className="col-span-8 space-y-1 text-[9px] leading-snug">
                      <div>
                        <span className="text-slate-500 block text-[7px] font-bold">APELLIDO, NOMBRE</span>
                        <span className="font-bold text-slate-200 uppercase truncate block">
                          {titular.apellido}, {titular.nombre}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <div>
                          <span className="text-slate-500 block text-[7px] font-bold">NRO DOCUMENTO</span>
                          <span className="font-semibold text-slate-300 block">{titular.numeroDocumento}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[7px] font-bold">SANGRE</span>
                          <span className="font-bold text-rose-400 block">{titular.grupoSanguineo} {titular.factorRh}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <div>
                          <span className="text-slate-500 block text-[7px] font-bold">FECHA EMISIÓN</span>
                          <span className="font-medium text-slate-400 block">
                            {new Date().toLocaleDateString("es-AR")}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[7px] font-bold">VENCIMIENTO</span>
                          <span className="font-bold text-indigo-400 block">
                            {(() => {
                              if (fechaVencimientoReal) {
                                const parts = fechaVencimientoReal.split('-');
                                return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)).toLocaleDateString("es-AR");
                              }
                              const v = calcularVigenciaTeorica();
                              if (v === 0) return "INVÁLIDO";
                              if (!titular) return "INVÁLIDO";
                              const parts = titular.fechaNacimiento.split('-');
                              const birthMonth = parseInt(parts[1], 10) - 1;
                              const birthDay = parseInt(parts[2], 10);
                              return new Date(new Date().getFullYear() + v, birthMonth, birthDay).toLocaleDateString("es-AR");
                            })()}
                          </span>
                        </div>
                      </div>
                      {observaciones && (
                        <div className="border-t border-indigo-500/10 pt-1 mt-1">
                          <span className="text-slate-500 block text-[7px] font-bold">OBSERVACIONES / LIMITACIONES</span>
                          <span className="font-bold text-amber-400 block text-[8px] uppercase truncate">
                            {observaciones}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pie de Firma y Holograma */}
                  <div className="absolute bottom-3 right-4 flex items-center gap-2 text-[6px] text-slate-500">
                    <div className="w-10 h-3 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-center opacity-65 font-mono text-[5px]">
                      HOLOG. Nac.
                    </div>
                    <span>Firma Autorizada</span>
                  </div>
                </div>

                {/* Botón de Envío */}
                <div className="w-full pt-4">
                  <button
                    onClick={procesarEmision}
                    disabled={actionLoading || !cumpleRestriccionEdad()}
                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-xl shadow-indigo-600/10 hover:shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-indigo-600 disabled:hover:to-violet-600"
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Procesando Emisión...
                      </>
                    ) : (
                      <>
                        Emitir Licencia Habilitante
                        <CheckCircle2 className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* PASO 3: DETALLE DE LIQUIDACIÓN Y ÉXITO */}
        {step === 3 && licenciaEmitida && detalleCostos && (
          <div className="space-y-8 border-t border-slate-800/80 pt-6 animate-fade-in">
            
            {/* Cabecera Éxito */}
            <div className="text-center space-y-2 py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-100">Licencia Emitida Correctamente</h2>
              <p className="text-sm text-slate-400">El registro de la licencia e historial del trámite ha sido guardado.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Carnet Emitido */}
              <div className="flex flex-col items-center justify-center space-y-3 bg-slate-950/20 border border-slate-800 rounded-2xl p-6">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Carnet Habilitado</span>
                
                {/* Carnet de Conducir */}
                <div className="w-full max-w-[320px] aspect-[1.586/1] rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/40 p-5 relative overflow-hidden shadow-2xl">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))]"></div>
                  
                  <div className="flex justify-between items-start border-b border-indigo-500/20 pb-2 relative z-10">
                    <div>
                      <span className="text-[8px] font-extrabold text-indigo-300 uppercase tracking-widest block">República Argentina</span>
                      <span className="text-[6px] text-slate-400 font-semibold tracking-wider block">LICENCIA NACIONAL DE CONDUCIR</span>
                    </div>
                    <div className="bg-indigo-600 text-white font-extrabold text-base px-2.5 py-0.5 rounded-lg">
                      {licenciaEmitida.clase}
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-3 mt-4 relative z-10">
                    <div className="col-span-4 aspect-square rounded-lg bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-slate-700">
                      <User className="w-7 h-7 text-slate-800" />
                      <span className="text-[6px] text-slate-600 font-bold">ACTIVO</span>
                    </div>

                    <div className="col-span-8 space-y-1 text-[8px] leading-snug">
                      <div>
                        <span className="text-slate-500 block text-[6px] font-bold">APELLIDO, NOMBRE</span>
                        <span className="font-bold text-slate-200 uppercase truncate block">
                          {titular?.apellido}, {titular?.nombre}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <div>
                          <span className="text-slate-500 block text-[6px] font-bold">DOCUMENTO</span>
                          <span className="font-semibold text-slate-300">{titular?.numeroDocumento}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[6px] font-bold">TIPO DE SANGRE</span>
                          <span className="font-bold text-rose-400">{titular?.grupoSanguineo} {titular?.factorRh}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <div>
                          <span className="text-slate-500 block text-[6px] font-bold">EMISIÓN</span>
                          <span className="font-medium text-slate-400">
                            {new Date(licenciaEmitida.fechaInicio).toLocaleDateString("es-AR")}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[6px] font-bold">VENCIMIENTO</span>
                          <span className="font-bold text-indigo-400">
                            {new Date(licenciaEmitida.fechaVencimiento).toLocaleDateString("es-AR")}
                          </span>
                        </div>
                      </div>
                      {licenciaEmitida.observaciones && (
                        <div className="border-t border-indigo-500/10 pt-0.5 mt-0.5">
                          <span className="text-slate-500 block text-[5px] font-bold">OBSERVACIONES / LIMITACIONES</span>
                          <span className="font-bold text-amber-400 block text-[7px] uppercase truncate">
                            {licenciaEmitida.observaciones}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="absolute bottom-2.5 right-4 flex items-center gap-2 text-[5px] text-slate-500">
                    <div className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold tracking-widest uppercase">
                      Habilitado
                    </div>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <span className="text-xs text-slate-400 font-bold block">ID Registro: #{licenciaEmitida.id}</span>
                  <span className="text-[10px] text-slate-500 mt-1 block">Estado: {licenciaEmitida.estado}</span>
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
                      <span className="text-slate-200 font-medium">Emisión Licencia Clase {licenciaEmitida.clase}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Vigencia otorgada</span>
                      <span className="text-slate-200 font-medium">{detalleCostos.vigenciaAnos} {detalleCostos.vigenciaAnos === 1 ? 'año' : 'años'}</span>
                    </div>

                    <div className="border-t border-slate-900 my-2 pt-2 space-y-2">
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Costo Base Licencia</span>
                        <span className="text-slate-200 font-semibold">${detalleCostos.costoBase.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Gastos Administrativos</span>
                        <span className="text-slate-200 font-semibold">${detalleCostos.gastosAdministrativos.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-800 pt-3.5 flex justify-between items-center text-slate-200 font-bold text-base">
                      <span>Monto Total Cobrado</span>
                      <span className="text-indigo-400 text-lg">${detalleCostos.costoTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
                  >
                    <Printer className="w-4 h-4" />
                    Imprimir Comprobante
                  </button>
                  <button
                    onClick={resetForm}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/20 transition-colors active:scale-[0.98]"
                  >
                    Nuevo Trámite
                  </button>
                </div>

              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
