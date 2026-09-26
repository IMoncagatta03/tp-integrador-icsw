package com.sistema.main.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.sistema.main.dto.LicenciaDTO;
import com.sistema.main.entity.Licencia;
import com.sistema.main.entity.enums.EstadoLicencia;
import com.sistema.main.repository.LicenciaRepository;
import com.sistema.main.util.FechaSimulada;
import com.sistema.main.mapper.LicenciaMapper;
import com.sistema.main.service.impl.LicenciaServiceImpl;

// Test unitario para verificar el comportamiento del programador de licencias.
@ExtendWith(MockitoExtension.class)
class LicenciaSchedulerTest {

    @Mock
    private LicenciaRepository licenciaRepository;

    @Mock
    private FechaSimulada fechaSimulada;

    @InjectMocks
    private LicenciaScheduler licenciaScheduler;

    @Mock
    private LicenciaMapper licenciaMapper;

    @InjectMocks
    private LicenciaServiceImpl licenciaService;

    @Test
    void testExpirarLicenciasVencidas() {
        when(fechaSimulada.getLocalDate()).thenReturn(LocalDate.now());
        when(licenciaRepository.actualizarEstadosExpirados(any(LocalDate.class))).thenReturn(5);

        licenciaScheduler.expirarLicenciasVencidas();

        verify(licenciaRepository, times(1)).actualizarEstadosExpirados(any(LocalDate.class));
    }

    // =========================================================================
    // TESTS: buscarLicenciasVigentes (Búsqueda por Criterios)
    // =========================================================================

    @Test
    void buscarLicenciasVigentes_debeRetornarListaMapeada_cuandoSePasanTodosLosFiltros() {
        // 1. ARRANGEMENT (Configuración del escenario)
        String nombreFiltro = "  Rodrigo  "; // Mandamos con espacios para probar el .trim()
        String grupoFiltro = "O";
        String factorFiltro = "POSITIVO";
        Boolean donanteFiltro = true;

        Licencia licenciaMock = new Licencia();
        licenciaMock.setId(105L);
        licenciaMock.setEstado(EstadoLicencia.VIGENTE);

        LicenciaDTO dtoEsperado = new LicenciaDTO();
        dtoEsperado.setId(105L);
        dtoEsperado.setEstado(EstadoLicencia.VIGENTE);

        // Simulamos que el repositorio encuentra la licencia usando los strings ya limpios (.trim())
        when(licenciaRepository.buscarVigentesPorCriterios("Rodrigo", "O", "POSITIVO", true))
                .thenReturn(List.of(licenciaMock));
        
        // Simulamos el mapeo a DTO
        when(licenciaMapper.toDTO(licenciaMock)).thenReturn(dtoEsperado);

        // 2. ACT (Ejecución)
        List<LicenciaDTO> resultado = licenciaService.buscarLicenciasVigentes(nombreFiltro, grupoFiltro, factorFiltro, donanteFiltro);

        // 3. ASSERT (Validaciones)
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals(105L, resultado.get(0).getId());

        // Verificamos interacciones de infraestructura crítica
        verify(licenciaRepository, times(1)).buscarVigentesPorCriterios("Rodrigo", "O", "POSITIVO", true);
        verify(licenciaMapper, times(1)).toDTO(licenciaMock);
    }

    @Test
    void buscarLicenciasVigentes_debeTratarStringsVaciosComoNull_cuandoNoSePasanFiltros() {
        // ARRANGEMENT
        // Simulamos que desde el frontend mandan cadenas vacías en los inputs de texto
        String nombreVacio = "   ";
        String grupoVacio = "";
        String factorVacio = null;
        Boolean donanteFiltro = null;

        // El servicio debería transformar los vacíos a null antes de llamar al repositorio
        when(licenciaRepository.buscarVigentesPorCriterios(null, null, null, null))
                .thenReturn(Collections.emptyList());

        // ACT
        List<LicenciaDTO> resultado = licenciaService.buscarLicenciasVigentes(nombreVacio, grupoVacio, factorVacio, donanteFiltro);

        // ASSERT
        assertTrue(resultado.isEmpty(), "Debería retornar una lista vacía de DTOs");
        verify(licenciaRepository, times(1)).buscarVigentesPorCriterios(null, null, null, null);
        verify(licenciaMapper, never()).toDTO(any()); // El mapper no debería ejecutarse si no hay entidades
    }
}
