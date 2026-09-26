package com.sistema.main.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.sistema.main.dto.CopiaLicenciaRequestDTO;
import com.sistema.main.dto.LicenciaDTO;
import com.sistema.main.dto.RenovacionLicenciaRequestDTO;
import com.sistema.main.entity.ConfiguracionSistema;
import com.sistema.main.entity.Licencia;
import com.sistema.main.entity.TarifaLicenciaId;
import com.sistema.main.entity.Titular;
import com.sistema.main.entity.Tramite;
import com.sistema.main.entity.Usuario;
import com.sistema.main.entity.enums.ClaseLicencia;
import com.sistema.main.entity.enums.EstadoLicencia;
import com.sistema.main.entity.enums.MotivoCopia;
import com.sistema.main.exception.RecursoNoEncontradoException;
import com.sistema.main.mapper.LicenciaMapper;
import com.sistema.main.repository.ConfiguracionSistemaRepository;
import com.sistema.main.repository.LicenciaRepository;
import com.sistema.main.repository.TarifaLicenciaRepository;
import com.sistema.main.repository.TramiteRepository;
import com.sistema.main.repository.UsuarioRepository;
import com.sistema.main.service.impl.LicenciaServiceImpl;
import com.sistema.main.util.FechaSimulada;

@ExtendWith(MockitoExtension.class)
class LicenciaServiceTest {

    @Mock private LicenciaRepository licenciaRepository;
    @Mock private TramiteRepository tramiteRepository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private TarifaLicenciaRepository tarifaLicenciaRepository;
    @Mock private ConfiguracionSistemaRepository configuracionRepository;
    @Mock private FechaSimulada fechaSimulada;
    @Mock private LicenciaMapper licenciaMapper;

    @InjectMocks
    private LicenciaServiceImpl licenciaService;

    private Titular titularJoven;
    private Titular titularAdulto;
    private LocalDate fechaSistema;

    @BeforeEach
    void setUp() {
        // Fijamos la fecha simulada del sistema en 2026
        fechaSistema = LocalDate.of(2026, 6, 26);

        // Titular de 18 años (Nacido en 2008)
        titularJoven = new Titular();
        titularJoven.setFechaNacimiento(LocalDate.of(2008, 6, 26));

        // Titular de 30 años (Nacido en 1996)
        titularAdulto = new Titular();
        titularAdulto.setFechaNacimiento(LocalDate.of(1996, 6, 26));
    }

    // =========================================================================
    // TESTS: calcularVigenciaAnos
    // =========================================================================

    @Test
    void calcularVigenciaAnos_debeRetornar5Anos_paraAdultoHasta46Anos() {
        when(fechaSimulada.getLocalDate()).thenReturn(fechaSistema);
        when(licenciaRepository.findByTitular(titularAdulto)).thenReturn(Collections.emptyList());

        int vigencia = licenciaService.calcularVigenciaAnos(titularAdulto, ClaseLicencia.B);

        assertEquals(5, vigencia);
    }

    @Test
    void calcularVigenciaAnos_debeRetornar1Ano_paraMenorDe21PrimeraVez() {
        when(fechaSimulada.getLocalDate()).thenReturn(fechaSistema);
        when(licenciaRepository.findByTitular(titularJoven)).thenReturn(Collections.emptyList());

        int vigencia = licenciaService.calcularVigenciaAnos(titularJoven, ClaseLicencia.A);

        assertEquals(1, vigencia);
    }

    @Test
    void calcularVigenciaAnos_debeRetornar3Anos_paraMenorDe21ConHistorialMismaClase() {
        when(fechaSimulada.getLocalDate()).thenReturn(fechaSistema);
        
        Licencia licenciaPrevia = new Licencia();
        licenciaPrevia.setClase(ClaseLicencia.A);
        when(licenciaRepository.findByTitular(titularJoven)).thenReturn(List.of(licenciaPrevia));

        int vigencia = licenciaService.calcularVigenciaAnos(titularJoven, ClaseLicencia.A);

        assertEquals(3, vigencia);
    }

    // =========================================================================
    // TESTS: verificarRequisitosEmision (Reglas de Negocio / Excepciones)
    // =========================================================================

    @Test
    void verificarRequisitosEmision_debeLanzarException_cuandoMenorDe21IntentaLicenciaProfesional() {
        assertThrows(RuntimeException.class, () -> {
            licenciaService.verificarRequisitosEmision(titularJoven, ClaseLicencia.C);
        });
    }

    @Test
    void verificarRequisitosEmision_debeLanzarException_cuandoProfesionalNoTieneAntiguedadEnClaseB() {
        when(fechaSimulada.getLocalDate()).thenReturn(fechaSistema);
        // Historial vacío => No tiene clase B previa
        when(licenciaRepository.findByTitular(titularAdulto)).thenReturn(Collections.emptyList());

        Exception exception = assertThrows(RuntimeException.class, () -> {
            licenciaService.verificarRequisitosEmision(titularAdulto, ClaseLicencia.C);
        });

        assertTrue(exception.getMessage().contains("Debe poseer licencia Clase B con un año de antigüedad"));
    }

    @Test
    void verificarRequisitosEmision_debeLanzarException_cuandoMenorDe17IntentaLicenciaComun() {
        when(fechaSimulada.getLocalDate()).thenReturn(fechaSistema);
        
        // Titular de 16 años (Nacido en 2010)
        Titular titularMuyJoven = new Titular();
        titularMuyJoven.setFechaNacimiento(LocalDate.of(2010, 6, 26));

        Exception exception = assertThrows(RuntimeException.class, () -> {
            licenciaService.verificarRequisitosEmision(titularMuyJoven, ClaseLicencia.B);
        });

        assertTrue(exception.getMessage().contains("Las licencias comunes exigen un mínimo de 17 años"));
    }

    @Test
    void verificarRequisitosEmision_debeLanzarException_cuandoMayorDe65IntentaProfesionalPorPrimeraVez() {
        when(fechaSimulada.getLocalDate()).thenReturn(fechaSistema);
        
        // Titular de 66 años (Nacido en 1960)
        Titular titularMayor = new Titular();
        titularMayor.setFechaNacimiento(LocalDate.of(1960, 6, 26));

        // Tiene licencia clase B previa de hace 2 años (por lo tanto cumple antigüedad pero es mayor de 65)
        Licencia licenciaB = new Licencia();
        licenciaB.setClase(ClaseLicencia.B);
        licenciaB.setFechaInicio(fechaSistema.minusYears(2));
        when(licenciaRepository.findByTitular(titularMayor)).thenReturn(List.of(licenciaB));

        Exception exception = assertThrows(RuntimeException.class, () -> {
            licenciaService.verificarRequisitosEmision(titularMayor, ClaseLicencia.C);
        });

        assertTrue(exception.getMessage().contains("No se permite otorgar licencias profesionales por primera vez a personas mayores de 65 años"));
    }

    @Test
    void verificarRequisitosEmision_debePermitirProfesional_cuandoMayorDe65YaTuvoLicenciaProfesional() {
        when(fechaSimulada.getLocalDate()).thenReturn(fechaSistema);
        
        // Titular de 66 años (Nacido en 1960)
        Titular titularMayor = new Titular();
        titularMayor.setFechaNacimiento(LocalDate.of(1960, 6, 26));

        // Ya tuvo una licencia clase C en el historial
        Licencia licenciaB = new Licencia();
        licenciaB.setClase(ClaseLicencia.B);
        licenciaB.setFechaInicio(fechaSistema.minusYears(5));

        Licencia licenciaC = new Licencia();
        licenciaC.setClase(ClaseLicencia.C);
        licenciaC.setFechaInicio(fechaSistema.minusYears(2));
        licenciaC.setEstado(EstadoLicencia.EXPIRADA);

        when(licenciaRepository.findByTitular(titularMayor)).thenReturn(List.of(licenciaB, licenciaC));

        // No debe lanzar excepción
        licenciaService.verificarRequisitosEmision(titularMayor, ClaseLicencia.C);
    }

    // =========================================================================
    // TESTS: emitirLicencia (Orquestación del Trámite)
    // =========================================================================

    @Test
    void emitirLicencia_debePersistirLicenciaYAuditoriaCorrectamente() {
        // Scenario: Adulto saca licencia común Clase B
        Long usuarioId = 99L;
        Usuario usuarioAdmin = new Usuario();
        usuarioAdmin.setId(usuarioId);

        when(fechaSimulada.getLocalDate()).thenReturn(fechaSistema);
        when(licenciaRepository.findByTitular(titularAdulto)).thenReturn(Collections.emptyList());
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuarioAdmin));
        
        // Mockear tarifas y configuraciones
        when(tarifaLicenciaRepository.findById(any(TarifaLicenciaId.class))).thenReturn(Optional.empty());
        ConfiguracionSistema configBase = new ConfiguracionSistema();
        configBase.setValor(BigDecimal.valueOf(15.00));
        when(configuracionRepository.findById("COSTO_EMISION_BASE")).thenReturn(Optional.of(configBase));

        ConfiguracionSistema configGastos = new ConfiguracionSistema();
        configGastos.setValor(BigDecimal.valueOf(8.00));
        when(configuracionRepository.findById("GASTOS_ADMINISTRATIVOS")).thenReturn(Optional.of(configGastos));

        // Mockear el comportamiento del save de JPA para simular que retorna la entidad guardada con ID
        when(licenciaRepository.save(any(Licencia.class))).thenAnswer(invocation -> {
            Licencia lic = invocation.getArgument(0);
            lic.setId(550L); // Simulamos que la BD le asigna ID 550
            return lic;
        });

        // ACT
        Licencia resultado = licenciaService.emitirLicencia(titularAdulto, ClaseLicencia.B, "Ninguna", usuarioId);

        // ASSERT
        assertNotNull(resultado);
        assertEquals(550L, resultado.getId());
        assertEquals(EstadoLicencia.VIGENTE, resultado.getEstado());
        assertEquals(ClaseLicencia.B, resultado.getClase());
        
        // Verificar que la fecha de vencimiento calce justo con el cumpleaños del titular (+5 años de vigencia)
        assertEquals(LocalDate.of(2031, 6, 26), resultado.getFechaVencimiento());

        // Verificar interacciones críticas
        verify(licenciaRepository, times(1)).save(any(Licencia.class));
        verify(tramiteRepository, times(1)).save(any(Tramite.class));
    }

    // =========================================================================
    // TESTS: obtenerLicenciasExpiradas
    // =========================================================================

    @Test
    void obtenerLicenciasExpiradas_debeRetornarListaDeDTOs() {
        when(fechaSimulada.getLocalDate()).thenReturn(fechaSistema);
        
        Licencia expirada = new Licencia();
        expirada.setId(10L);
        when(licenciaRepository.findByFechaVencimientoBefore(fechaSistema)).thenReturn(List.of(expirada));

        LicenciaDTO dto = new LicenciaDTO();
        dto.setId(10L);
        when(licenciaMapper.toDTO(expirada)).thenReturn(dto);

        List<LicenciaDTO> resultado = licenciaService.obtenerLicenciasExpiradas();

        assertFalse(resultado.isEmpty());
        assertEquals(10L, resultado.get(0).getId());
    }

    // =========================================================================
    // TESTS: renovarLicencia
    // =========================================================================

    @Test
    void renovarLicencia_debeExpirarLicenciaAnteriorYCrearNueva_cuandoLaLicenciaExiste() {
        // 1. ARRANGEMENT (Configuración del escenario)
        Long idViejo = 200L;
        Integer anosNuevos = 4;
        RenovacionLicenciaRequestDTO requestDTO = new RenovacionLicenciaRequestDTO(idViejo, anosNuevos, "Renovación por vencimiento");

        // Creamos el titular que va a heredar la nueva licencia (30 años)
        Titular titularMock = new Titular();
        titularMock.setId(10L);
        titularMock.setNombre("Juan");
        titularMock.setApellido("Perez");
        titularMock.setFechaNacimiento(LocalDate.of(1996, 6, 26));

        // Simulamos la licencia que ya estaba guardada en el sistema
        Licencia licenciaViejaMock = new Licencia();
        licenciaViejaMock.setId(idViejo);
        licenciaViejaMock.setClase(ClaseLicencia.B);
        licenciaViejaMock.setEstado(EstadoLicencia.VIGENTE);
        licenciaViejaMock.setTitular(titularMock);

        LicenciaDTO dtoEsperado = new LicenciaDTO();
        dtoEsperado.setId(201L); // El ID de la nueva licencia generada
        dtoEsperado.setEstado(EstadoLicencia.VIGENTE);

        // Configuramos los comportamientos de los mocks
        when(fechaSimulada.getLocalDate()).thenReturn(fechaSistema);
        when(licenciaRepository.findById(idViejo)).thenReturn(Optional.of(licenciaViejaMock));
        when(licenciaRepository.findByTitular(titularMock)).thenReturn(Collections.emptyList());
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(new Usuario()));
        
        // Mockear tarifas y configuraciones
        when(tarifaLicenciaRepository.findById(any(TarifaLicenciaId.class))).thenReturn(Optional.empty());
        ConfiguracionSistema configBase = new ConfiguracionSistema("COSTO_EMISION_BASE", BigDecimal.valueOf(15.00), null);
        when(configuracionRepository.findById("COSTO_EMISION_BASE")).thenReturn(Optional.of(configBase));
        ConfiguracionSistema configGastos = new ConfiguracionSistema("GASTOS_ADMINISTRATIVOS", BigDecimal.valueOf(8.00), null);
        when(configuracionRepository.findById("GASTOS_ADMINISTRATIVOS")).thenReturn(Optional.of(configGastos));

        // El repositorio va a guardar dos veces: primero la vieja modificada, luego la nueva
        // Con any(Licencia.class) interceptamos ambas y hacemos que devuelva el argumento recibido
        when(licenciaRepository.save(any(Licencia.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(licenciaMapper.toDTO(any(Licencia.class))).thenReturn(dtoEsperado);

        // 2. ACT (Ejecución)
        LicenciaDTO resultado = licenciaService.renovarLicencia(requestDTO, 1L);

        // 3. ASSERT (Validaciones críticas de negocio)
        assertNotNull(resultado);
        assertEquals(EstadoLicencia.VIGENTE, resultado.getEstado());
        
        // Verificación de estados del historial de auditoría
        assertEquals(EstadoLicencia.EXPIRADA, licenciaViejaMock.getEstado(), 
                "La licencia anterior debe pasar a estar EXPIRADA en el historial");

        // Verificamos las interacciones con el repositorio
        verify(licenciaRepository, times(1)).findById(idViejo);
        verify(licenciaRepository, times(2)).save(any(Licencia.class)); // Una para la vieja, una para la nueva
        verify(tramiteRepository, times(1)).save(any(Tramite.class)); // El trámite de auditoría
    }

    @Test
    void renovarLicencia_debeLanzarException_cuandoLaLicenciaAnteriorNoExiste() {
        // ARRANGEMENT
        RenovacionLicenciaRequestDTO requestDTO = new RenovacionLicenciaRequestDTO(999L, 3, "Error");

        when(licenciaRepository.findById(999L)).thenReturn(Optional.empty());

        // ACT & ASSERT
        assertThrows(RecursoNoEncontradoException.class, () -> {
            licenciaService.renovarLicencia(requestDTO, 1L);
        }, "Debería fallar si intentan renovar un ID de licencia fantasma");

        // Verificamos que el flujo se cortó y nunca intentó persistir nada
        verify(licenciaRepository, never()).save(any(Licencia.class));
    }

    @Test
    void renovarLicencia_debeLanzarException_cuandoLaLicenciaYaEstaArchivada() {
        // ARRANGEMENT
        Long idViejo = 200L;
        RenovacionLicenciaRequestDTO requestDTO = new RenovacionLicenciaRequestDTO(idViejo, 4, "Renovación");

        Titular titularMock = new Titular();
        titularMock.setId(10L);

        Licencia licenciaVieja = new Licencia();
        licenciaVieja.setId(idViejo);
        licenciaVieja.setClase(ClaseLicencia.B);
        licenciaVieja.setTitular(titularMock);

        // Simulamos otra licencia más nueva en el historial del titular (ID 205 > ID 200)
        Licencia licenciaNueva = new Licencia();
        licenciaNueva.setId(205L);
        licenciaNueva.setClase(ClaseLicencia.B);
        licenciaNueva.setTitular(titularMock);

        when(licenciaRepository.findById(idViejo)).thenReturn(Optional.of(licenciaVieja));
        when(licenciaRepository.findByTitular(titularMock)).thenReturn(List.of(licenciaVieja, licenciaNueva));

        // ACT & ASSERT
        Exception exception = assertThrows(RuntimeException.class, () -> {
            licenciaService.renovarLicencia(requestDTO, 1L);
        });

        assertTrue(exception.getMessage().contains("no se puede renovar una licencia ya archivada"));
        verify(licenciaRepository, never()).save(any(Licencia.class));
    }

    // =========================================================================
    // TESTS: emitirCopiaLicencia
    // =========================================================================

    @Test
    void emitirCopiaLicencia_debeClonarFechasYExpirarOriginal_cuandoLaLicenciaExiste() {
        // ARRANGEMENT
        Long idOriginal = 500L;
        CopiaLicenciaRequestDTO requestDTO = new CopiaLicenciaRequestDTO(idOriginal, MotivoCopia.ROBO);

        LocalDate fechaInicioOriginal = LocalDate.of(2025, 1, 1);
        LocalDate fechaVenceOriginal = LocalDate.of(2030, 1, 1);

        Titular titularMock = new Titular();
        titularMock.setId(10L);

        Licencia originalMock = new Licencia();
        originalMock.setId(idOriginal);
        originalMock.setClase(ClaseLicencia.A);
        originalMock.setEstado(EstadoLicencia.VIGENTE);
        originalMock.setFechaInicio(fechaInicioOriginal);
        originalMock.setFechaVencimiento(fechaVenceOriginal);
        originalMock.setTitular(titularMock);

        LicenciaDTO dtoEsperado = new LicenciaDTO();
        dtoEsperado.setId(501L);
        dtoEsperado.setEstado(EstadoLicencia.VIGENTE);

        when(licenciaRepository.findById(idOriginal)).thenReturn(Optional.of(originalMock));
        when(licenciaRepository.findByTitular(titularMock)).thenReturn(List.of(originalMock));
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(new Usuario()));
        when(configuracionRepository.findById("COSTO_COPIA")).thenReturn(Optional.of(new ConfiguracionSistema("COSTO_COPIA", BigDecimal.valueOf(50.00), null)));
        when(licenciaRepository.save(any(Licencia.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(licenciaMapper.toDTO(any(Licencia.class))).thenReturn(dtoEsperado);

        // ACT
        LicenciaDTO resultado = licenciaService.emitirCopiaLicencia(requestDTO, 1L);

        // ASSERT
        assertNotNull(resultado);
        assertEquals(EstadoLicencia.EXPIRADA, originalMock.getEstado(), "La original debe quedar archivada");
        
        // Verificamos que al llamar a save con la copia, esta mantenga las fechas
        verify(licenciaRepository, times(2)).save(any(Licencia.class));
        verify(tramiteRepository, times(1)).save(any(Tramite.class));
    }

}