package com.sistema.main.service;

import com.sistema.main.dto.CostoLicenciaRequestDTO;
import com.sistema.main.dto.CostoLicenciaResponseDTO;
import com.sistema.main.entity.ConfiguracionSistema;
import com.sistema.main.entity.TarifaLicencia;
import com.sistema.main.entity.TarifaLicenciaId;
import com.sistema.main.entity.enums.ClaseLicencia;
import com.sistema.main.exception.RecursoNoEncontradoException;
import com.sistema.main.repository.ConfiguracionSistemaRepository;
import com.sistema.main.repository.TarifaLicenciaRepository;
import com.sistema.main.service.impl.ConfiguracionServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ConfiguracionServiceImplTest {

    @Mock
    private TarifaLicenciaRepository tarifaRepository;

    @Mock
    private ConfiguracionSistemaRepository configuracionRepository;

    @InjectMocks
    private ConfiguracionServiceImpl configuracionService;

    @Test
    void calcularCostoLicencia_debeCalcularTotalCorrectamente_cuandoLaTarifaYConfiguracionExisten() {
        // 1. ARRANGEMENT (Configuramos el escenario basado en la tablita de la UTN)
        // Simulamos una solicitud para Clase B por 3 años (Costo base esperado según tabla: $25)
        CostoLicenciaRequestDTO requestDTO = new CostoLicenciaRequestDTO(ClaseLicencia.B, 3);
        
        TarifaLicenciaId idEsperado = new TarifaLicenciaId(ClaseLicencia.B, 3);
        TarifaLicencia tarifaMock = new TarifaLicencia();
        tarifaMock.setId(idEsperado);
        tarifaMock.setCosto(new BigDecimal("25.00"));

        ConfiguracionSistema gastosMock = new ConfiguracionSistema("GASTOS_ADMINISTRATIVOS", new BigDecimal("8.00"), "Gastos fijos");

        // Definimos los comportamientos de los mocks
        when(tarifaRepository.findById(idEsperado)).thenReturn(Optional.of(tarifaMock));
        when(configuracionRepository.findById("GASTOS_ADMINISTRATIVOS")).thenReturn(Optional.of(gastosMock));

        // 2. ACT (Ejecutamos el método a probar)
        CostoLicenciaResponseDTO resultado = configuracionService.calcularCostoLicencia(requestDTO);

        // 3. ASSERT (Validamos que la matemática de la municipalidad de 25 + 8 dé exacta)
        assertNotNull(resultado, "La respuesta no debería ser nula");
        assertEquals(new BigDecimal("25.00"), resultado.getCostoTarifa(), "El costo base debe ser $25.00");
        assertEquals(new BigDecimal("8.00"), resultado.getGastosAdministrativos(), "Los gastos administrativos deben ser $8.00");
        assertEquals(new BigDecimal("33.00"), resultado.getCostoTotal(), "El costo total final debe ser $33.00 (25 + 8)");

        // Verificamos que se golpeó a la base de datos de forma correcta
        verify(tarifaRepository, times(1)).findById(idEsperado);
        verify(configuracionRepository, times(1)).findById("GASTOS_ADMINISTRATIVOS");
    }

    @Test
    void calcularCostoLicencia_debeLanzarException_cuandoLaTarifaNoExisteEnLaBaseDeDatos() {
        // ARRANGEMENT
        // Mandamos una combinación inválida o que no esté cargada en el sistema
        CostoLicenciaRequestDTO requestDTO = new CostoLicenciaRequestDTO(ClaseLicencia.E, 1);
        TarifaLicenciaId idInvalido = new TarifaLicenciaId(ClaseLicencia.E, 1);

        when(tarifaRepository.findById(idInvalido)).thenReturn(Optional.empty());

        // ACT & ASSERT
        assertThrows(RecursoNoEncontradoException.class, () -> {
            configuracionService.calcularCostoLicencia(requestDTO);
        }, "Debería arrojar una excepción de recurso no encontrado");

        // Si la tarifa no existe, el flujo se corta y nunca debería ir a buscar los gastos administrativos
        verify(configuracionRepository, never()).findById(anyString());
    }

    @Test
    void calcularCostoLicencia_debeUsarValorPorDefecto_cuandoLosGastosNoEstanEnLaConfiguracion() {
        // ARRANGEMENT
        CostoLicenciaRequestDTO requestDTO = new CostoLicenciaRequestDTO(ClaseLicencia.A, 5); // Costo base: $40
        TarifaLicenciaId idEsperado = new TarifaLicenciaId(ClaseLicencia.A, 5);
        
        TarifaLicencia tarifaMock = new TarifaLicencia();
        tarifaMock.setId(idEsperado);
        tarifaMock.setCosto(new BigDecimal("40.00"));

        when(tarifaRepository.findById(idEsperado)).thenReturn(Optional.of(tarifaMock));
        // Simulamos el caso extremo de que un operador borró la fila 'GASTOS_ADMINISTRATIVOS' de PostgreSQL
        when(configuracionRepository.findById("GASTOS_ADMINISTRATIVOS")).thenReturn(Optional.empty());

        // ACT
        CostoLicenciaResponseDTO resultado = configuracionService.calcularCostoLicencia(requestDTO);

        // ASSERT
        assertNotNull(resultado);
        assertEquals(new BigDecimal("8.00"), resultado.getGastosAdministrativos(), "Debe usar el fallback de $8.00 del enunciado");
        assertEquals(new BigDecimal("48.00"), resultado.getCostoTotal(), "El total debe calcularse igual (40 + 8)");
    }
}