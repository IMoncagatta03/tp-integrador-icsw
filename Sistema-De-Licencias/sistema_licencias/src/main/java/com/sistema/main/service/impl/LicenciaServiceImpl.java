package com.sistema.main.service.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.sistema.main.dto.CopiaLicenciaRequestDTO;
import com.sistema.main.dto.LicenciaDTO;
import com.sistema.main.dto.RenovacionLicenciaRequestDTO;
import com.sistema.main.entity.Licencia;
import com.sistema.main.entity.TarifaLicenciaId;
import com.sistema.main.entity.Titular;
import com.sistema.main.entity.Tramite;
import com.sistema.main.entity.Usuario;
import com.sistema.main.entity.enums.ClaseLicencia;
import com.sistema.main.entity.enums.EstadoLicencia;
import com.sistema.main.entity.enums.TipoTramite;
import com.sistema.main.exception.RecursoNoEncontradoException;
import com.sistema.main.repository.ConfiguracionSistemaRepository;
import com.sistema.main.repository.LicenciaRepository;
import com.sistema.main.repository.TarifaLicenciaRepository;
import com.sistema.main.repository.TramiteRepository;
import com.sistema.main.repository.UsuarioRepository;
import com.sistema.main.util.FechaSimulada;
import com.sistema.main.mapper.LicenciaMapper;
import com.sistema.main.service.LicenciaService;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LicenciaServiceImpl implements LicenciaService {

    private final LicenciaRepository licenciaRepository;

    private final TramiteRepository tramiteRepository;

    private final UsuarioRepository usuarioRepository;

    private final TarifaLicenciaRepository tarifaLicenciaRepository;

    private final ConfiguracionSistemaRepository configuracionRepository;

    private final FechaSimulada fechaSimulada;

    private final LicenciaMapper licenciaMapper;

    /**
     * Calcula la vigencia en años según la edad del titular y sus antecedentes.
     */
    public int calcularVigenciaAnos(Titular titular, ClaseLicencia clase) {
        if (titular.getFechaNacimiento() == null) {
            throw new IllegalArgumentException("Falta la fecha de nacimiento del titular.");
        }
        int edad = Period.between(titular.getFechaNacimiento(), fechaSimulada.getLocalDate()).getYears();

        List<Licencia> historial = licenciaRepository.findByTitular(titular);
        boolean yaTuvoMismaClase = historial.stream()
                .anyMatch(lic -> lic.getClase() == clase);

        if (edad < 17) {
            throw new RuntimeException("Error: Las licencias comunes exigen un mínimo de 17 años.");
        }
        if (edad < 21) {
            return yaTuvoMismaClase ? 3 : 1;
        }
        if (edad <= 46) {
            return 5;
        }
        if (edad <= 60) {
            return 4;
        }
        if (edad <= 70) {
            return 3;
        }
        // Mayor de 70 años
        return 1;
    }

    /**
     * MAS-26 y MAS-27: Valida de forma rigurosa los requisitos de edad y
     * antecedentes.
     */
    public void verificarRequisitosEmision(Titular titular, ClaseLicencia claseSolicitada) {
        if (titular.getFechaNacimiento() == null) {
            throw new IllegalArgumentException("Falta la fecha de nacimiento del titular.");
        }

        // Buscamos el historial completo en PostgreSQL
        List<Licencia> historial = licenciaRepository.findByTitular(titular);

        int edad = Period.between(titular.getFechaNacimiento(), fechaSimulada.getLocalDate()).getYears();
        boolean esProfesional = (claseSolicitada == ClaseLicencia.C ||
                claseSolicitada == ClaseLicencia.D ||
                claseSolicitada == ClaseLicencia.E);

        // 1. Validación de Edades Mínimas (MAS-26)
        if (esProfesional && edad < 21) {
            throw new RuntimeException("Error: Las licencias profesionales (C, D, E) exigen un mínimo de 21 años.");
        }
        if (!esProfesional && edad < 17) {
            throw new RuntimeException("Error: Las licencias comunes exigen un mínimo de 17 años.");
        }

        // 2. Validación de Antecedentes para Clases Profesionales (MAS-27)
        if (esProfesional) {
            boolean cumpleLicenciaBPrevia = historial.stream()
                    .anyMatch(lic -> lic.getClase() == ClaseLicencia.B &&
                            !lic.getFechaInicio().isAfter(fechaSimulada.getLocalDate().minusYears(1)));

            if (!cumpleLicenciaBPrevia) {
                throw new RuntimeException("Error: Debe poseer licencia Clase B con un año de antigüedad mínimo.");
            }

            // Restricción de primera vez para mayores de 65 años (MAS-27)
            if (edad > 65) {
                boolean yaTuvoLicenciaProfesional = historial.stream()
                        .anyMatch(lic -> lic.getClase() == ClaseLicencia.C ||
                                lic.getClase() == ClaseLicencia.D ||
                                lic.getClase() == ClaseLicencia.E);

                if (!yaTuvoLicenciaProfesional) {
                    throw new RuntimeException(
                            "Error: No se permite otorgar licencias profesionales por primera vez a personas mayores de 65 años.");
                }
            }
        }
    }

    /**
     * MAS-28: Orquestación del Trámite
     * Coordina el chequeo de reglas de negocio y persiste la nueva licencia.
     */
    @Transactional
    public Licencia emitirLicencia(Titular titular, ClaseLicencia clase, String observaciones, Long usuarioId) {

        // Validar si ya posee una licencia vigente de la misma clase (evita error de base de datos)
        List<Licencia> historial = licenciaRepository.findByTitular(titular);
        boolean yaTieneLicenciaVigente = historial.stream()
                .anyMatch(lic -> lic.getClase() == clase && lic.getEstado() == EstadoLicencia.VIGENTE);
        if (yaTieneLicenciaVigente) {
            throw new RuntimeException("el titular " + titular.getNombre() + " " + titular.getApellido() + " ya tiene una licencia clase " + clase);
        }

        // 1. Ejecutamos el validador unificado de requisitos (MAS-26 y MAS-27)
        verificarRequisitosEmision(titular, clase);

        // Calcular vigencia en años según la edad
        int vigenciaAnos = calcularVigenciaAnos(titular, clase);

        // 2. Construimos el objeto Licencia (MAS-22)
        Licencia nuevaLicencia = new Licencia();
        nuevaLicencia.setTitular(titular);
        nuevaLicencia.setClase(clase);
        nuevaLicencia.setObservaciones(observaciones);
        nuevaLicencia.setEstado(EstadoLicencia.VIGENTE);
        
        LocalDate fechaInicio = fechaSimulada.getLocalDate();
        nuevaLicencia.setFechaInicio(fechaInicio);
        
        // El día y mes de vencimiento coinciden con los de nacimiento del titular
        LocalDate fechaVencimiento = titular.getFechaNacimiento().withYear(fechaInicio.getYear() + vigenciaAnos);
        nuevaLicencia.setFechaVencimiento(fechaVencimiento);

        // 3. Persistimos la licencia de forma real en PostgreSQL para generar su ID
        Licencia licenciaGuardada = licenciaRepository.save(nuevaLicencia);

        // 4. MAS-30: Creamos el registro de auditoría histórica
        Tramite auditoria = new Tramite();
        auditoria.setLicencia(licenciaGuardada);

        // Asociamos el usuario administrativo que realiza el trámite
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException(
                        "Error: Usuario administrativo con ID " + usuarioId + " no encontrado en el sistema."));
        auditoria.setUsuario(usuario);

        auditoria.setTipoTramite(TipoTramite.EMISION);

        // Buscamos el costo base parametrizado en la base de datos
        BigDecimal costoBase = tarifaLicenciaRepository.findById(new TarifaLicenciaId(clase, vigenciaAnos))
                .map(tarifa -> tarifa.getCosto())
                .orElseGet(() -> configuracionRepository.findById("COSTO_EMISION_BASE")
                        .map(config -> config.getValor())
                        .orElse(BigDecimal.valueOf(15.00)));

        auditoria.setCostoBase(costoBase);

        // Buscamos los gastos administrativos de la configuración
        BigDecimal gastosAdministrativos = configuracionRepository.findById("GASTOS_ADMINISTRATIVOS")
                .map(config -> config.getValor())
                .orElse(BigDecimal.valueOf(8.00));

        auditoria.setGastosAdministrativos(gastosAdministrativos);

        // Guardamos el trámite en la base de datos
        tramiteRepository.save(auditoria);

        return licenciaGuardada;
    }

    /**
     * Recupera todas las licencias que han expirado respecto a la fecha simulada del sistema.
     */
    public List<LicenciaDTO> obtenerLicenciasExpiradas() {
        // Usamos la fecha simulada para determinar la expiración actual del sistema
        LocalDate fechaActualSimulada = fechaSimulada.getLocalDate();
        List<Licencia> licenciasExpiradas = licenciaRepository.findByFechaVencimientoBefore(fechaActualSimulada);
        
        // Mapeamos la lista de entidades a DTOs
        // Nota: Asegúrate de tener inyectado tu 'licenciaMapper' en los atributos de arriba si lo vas a usar así.
        return licenciasExpiradas.stream()
                .map(licenciaMapper::toDTO) // O 'licenciaMapper::toDTO'
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<LicenciaDTO> buscarLicenciasVigentes(String nombre, String grupoSanguineo, String factorRh, Boolean donante) {
        // Si el string de nombre viene vacío "" lo tratamos como null para el Query
        String filtroNombre = (nombre != null && !nombre.isBlank()) ? nombre.trim() : null;
        String filtroGrupo = (grupoSanguineo != null && !grupoSanguineo.isBlank()) ? grupoSanguineo.trim() : null;
        String filtroRh = (factorRh != null && !factorRh.isBlank()) ? factorRh.trim() : null;

        List<Licencia> licencias = licenciaRepository.buscarVigentesPorCriterios(filtroNombre, filtroGrupo, filtroRh, donante);

        // Reutilizamos tu mapper manual mapeando a LicenciaDTO
        return licencias.stream()
                .map(licenciaMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public LicenciaDTO renovarLicencia(RenovacionLicenciaRequestDTO request, Long idUsuarioOperador) {
        // 1. Buscamos la licencia vieja que se quiere renovar
        Licencia licenciaVieja = licenciaRepository.findById(request.getIdLicenciaAnterior())
                .orElseThrow(() -> new RecursoNoEncontradoException("No se encontró la licencia a renovar."));

        // Validar si la licencia ya está archivada (es decir, existe otra más reciente del mismo titular y clase)
        List<Licencia> historial = licenciaRepository.findByTitular(licenciaVieja.getTitular());
        boolean esArchivada = historial.stream()
                .anyMatch(lic -> lic.getClase() == licenciaVieja.getClase() && lic.getId() > licenciaVieja.getId());
        if (esArchivada) {
            throw new RuntimeException("no se puede renovar una licencia ya archivada");
        }

        // 2. Ejecutar validaciones de requisitos (edad mínima, etc.)
        verificarRequisitosEmision(licenciaVieja.getTitular(), licenciaVieja.getClase());

        // 3. Pasamos la licencia anterior al historial (cambiamos su estado a EXPIRADA)
        licenciaVieja.setEstado(EstadoLicencia.EXPIRADA);
        licenciaRepository.save(licenciaVieja);
        licenciaRepository.flush();

        // 4. Instanciamos la nueva Licencia clonando el Titular
        Licencia nuevaLicencia = new Licencia();
        nuevaLicencia.setTitular(licenciaVieja.getTitular()); // Mismo titular
        nuevaLicencia.setClase(licenciaVieja.getClase());     // Mismo tipo de carnet (A, B, etc.)
        
        LocalDate fechaInicio = fechaSimulada.getLocalDate();
        nuevaLicencia.setFechaInicio(fechaInicio);
        
        // El día y mes de vencimiento coinciden con los de nacimiento del titular
        LocalDate fechaVencimiento = licenciaVieja.getTitular().getFechaNacimiento().withYear(fechaInicio.getYear() + request.getVigenciaAnosNuevos());
        nuevaLicencia.setFechaVencimiento(fechaVencimiento);
        nuevaLicencia.setEstado(EstadoLicencia.VIGENTE); // Nace vigente
        nuevaLicencia.setObservaciones(request.getObservaciones());

        // 5. Guardamos en la base de datos
        Licencia licenciaGuardada = licenciaRepository.save(nuevaLicencia);

        // 6. Creamos el trámite de renovación para auditoría histórica
        com.sistema.main.entity.Tramite auditoria = new com.sistema.main.entity.Tramite();
        auditoria.setLicencia(licenciaGuardada);

        com.sistema.main.entity.Usuario usuario = usuarioRepository.findById(idUsuarioOperador)
                .orElseThrow(() -> new RuntimeException(
                        "Error: Usuario administrativo con ID " + idUsuarioOperador + " no encontrado en el sistema."));
        auditoria.setUsuario(usuario);
        auditoria.setTipoTramite(com.sistema.main.entity.enums.TipoTramite.RENOVACION);

        // Buscamos el costo base parametrizado en la base de datos
        BigDecimal costoBase = tarifaLicenciaRepository.findById(new com.sistema.main.entity.TarifaLicenciaId(licenciaVieja.getClase(), request.getVigenciaAnosNuevos()))
                .map(tarifa -> tarifa.getCosto())
                .orElseGet(() -> configuracionRepository.findById("COSTO_EMISION_BASE")
                        .map(config -> config.getValor())
                        .orElse(BigDecimal.valueOf(15.00)));
        auditoria.setCostoBase(costoBase);

        // Buscamos los gastos administrativos de la configuración
        BigDecimal gastosAdministrativos = configuracionRepository.findById("GASTOS_ADMINISTRATIVOS")
                .map(config -> config.getValor())
                .orElse(BigDecimal.valueOf(8.00));
        auditoria.setGastosAdministrativos(gastosAdministrativos);

        tramiteRepository.save(auditoria);

        // 7. Retornamos usando el mapper
        return licenciaMapper.toDTO(licenciaGuardada);
    }

    @Override
    @Transactional
    public LicenciaDTO emitirCopiaLicencia(CopiaLicenciaRequestDTO request, Long idUsuarioOperador) {
        // 1. Buscamos la licencia original
        Licencia licenciaOriginal = licenciaRepository.findById(request.getIdLicenciaOriginal())
                .orElseThrow(() -> new RecursoNoEncontradoException("No se encontró la licencia original para emitir la copia."));

        // Validamos que esté vigente
        if (licenciaOriginal.getEstado() != EstadoLicencia.VIGENTE) {
            throw new RuntimeException("Solo se pueden realizar copias de licencias vigentes.");
        }

        // 2. La licencia original pasa al historial (cambia su estado)
        licenciaOriginal.setEstado(EstadoLicencia.EXPIRADA);
        licenciaRepository.save(licenciaOriginal);
        licenciaRepository.flush();

        // Determinar tipo de copia
        List<Licencia> historial = licenciaRepository.findByTitular(licenciaOriginal.getTitular());
        long countPrevias = historial.stream()
                .filter(lic -> lic.getClase() == licenciaOriginal.getClase() && !lic.getId().equals(licenciaOriginal.getId()))
                .count();

        String copyLabel;
        com.sistema.main.entity.enums.TipoTramite tipoTramite;
        if (countPrevias == 0) {
            copyLabel = "DUPLICADO";
            tipoTramite = com.sistema.main.entity.enums.TipoTramite.DUPLICADO;
        } else if (countPrevias == 1) {
            copyLabel = "TRIPLICADO";
            tipoTramite = com.sistema.main.entity.enums.TipoTramite.TRIPLICADO;
        } else if (countPrevias == 2) {
            copyLabel = "CUADRUPLICADO";
            tipoTramite = com.sistema.main.entity.enums.TipoTramite.TRIPLICADO; // Usamos TRIPLICADO en base de datos
        } else if (countPrevias == 3) {
            copyLabel = "QUINTUPLICADO";
            tipoTramite = com.sistema.main.entity.enums.TipoTramite.TRIPLICADO;
        } else {
            copyLabel = "COPIA NRO " + (countPrevias + 2);
            tipoTramite = com.sistema.main.entity.enums.TipoTramite.TRIPLICADO;
        }

        // 3. Creamos el nuevo carnet copiando exactamente las propiedades originales
        Licencia copiaLicencia = new Licencia();
        copiaLicencia.setTitular(licenciaOriginal.getTitular());
        copiaLicencia.setClase(licenciaOriginal.getClase());
        
        // CRÍTICO: Mantiene las mismas fechas que la original (No se extiende la vigencia)
        copiaLicencia.setFechaInicio(licenciaOriginal.getFechaInicio());
        copiaLicencia.setFechaVencimiento(licenciaOriginal.getFechaVencimiento());
        
        copiaLicencia.setEstado(EstadoLicencia.VIGENTE);
        copiaLicencia.setObservaciones("Copia (" + copyLabel + ") emitida por motivo: " + request.getMotivoCopia().name());

        // 4. Guardamos la copia en PostgreSQL
        Licencia copiaGuardada = licenciaRepository.save(copiaLicencia);

        // 5. Crear el trámite de auditoría
        com.sistema.main.entity.Tramite auditoria = new com.sistema.main.entity.Tramite();
        auditoria.setLicencia(copiaGuardada);

        com.sistema.main.entity.Usuario usuario = usuarioRepository.findById(idUsuarioOperador)
                .orElseThrow(() -> new RuntimeException(
                        "Error: Usuario administrativo con ID " + idUsuarioOperador + " no encontrado."));
        auditoria.setUsuario(usuario);
        auditoria.setTipoTramite(tipoTramite);

        // Costo de copia desde la configuración
        BigDecimal costoCopia = configuracionRepository.findById("COSTO_COPIA")
                .map(config -> config.getValor())
                .orElse(BigDecimal.valueOf(50.00));
        auditoria.setCostoBase(costoCopia);
        auditoria.setGastosAdministrativos(BigDecimal.ZERO);

        tramiteRepository.save(auditoria);

        // 6. Retornamos mapeado a DTO
        return licenciaMapper.toDTO(copiaGuardada);
    }

}