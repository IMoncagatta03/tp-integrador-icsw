package com.sistema.main.service;

import com.sistema.main.dto.TitularModificacionDTO;
import com.sistema.main.dto.TitularRequestDTO;
import com.sistema.main.dto.TitularResponseDTO;
import com.sistema.main.entity.Titular;
import com.sistema.main.exception.RecursoNoEncontradoException;
import com.sistema.main.exception.TitularDuplicadoException;
import com.sistema.main.exception.TitularNotFoundException;
import com.sistema.main.mapper.TitularMapper;
import com.sistema.main.repository.TitularRepository;
import com.sistema.main.service.impl.TitularServiceImpl;
import com.sistema.main.util.FechaSimulada;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TitularServiceImplTest {

    @Mock
    private TitularRepository titularRepository;

    @Mock
    private TitularMapper titularMapper;

    @Mock
    private FechaSimulada fechaSimulada;

    @InjectMocks
    private TitularServiceImpl titularService;

    private LocalDate mockSystemDate = LocalDate.of(2026, 6, 27);
    private TitularRequestDTO requestValido;
    private TitularRequestDTO requestMenorDeEdad;
    private Titular titularEntidad;
    private TitularResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        // Mock default system date
        lenient().when(fechaSimulada.getLocalDate()).thenReturn(mockSystemDate);

        // Valid request: Juan Perez, 18 years old on 2026-06-27
        requestValido = new TitularRequestDTO();
        requestValido.setTipoDocumento("DNI");
        requestValido.setNumeroDocumento("50123456");
        requestValido.setNombre("Juan Ignacio");
        requestValido.setApellido("Perez");
        requestValido.setFechaNacimiento(LocalDate.of(2008, 6, 15));
        requestValido.setDireccion("San Martin 1234");
        requestValido.setGrupoSanguineo("A");
        requestValido.setFactorRh("+");
        requestValido.setDonanteOrganos(false);

        // Invalid request (Too young): 11 years old on 2026-06-27
        requestMenorDeEdad = new TitularRequestDTO();
        requestMenorDeEdad.setTipoDocumento("DNI");
        requestMenorDeEdad.setNumeroDocumento("60123456");
        requestMenorDeEdad.setNombre("Pedro");
        requestMenorDeEdad.setApellido("Perez");
        requestMenorDeEdad.setFechaNacimiento(LocalDate.of(2015, 6, 15));

        titularEntidad = new Titular();
        titularEntidad.setId(1L);
        titularEntidad.setTipoDocumento("DNI");
        titularEntidad.setNumeroDocumento("50123456");
        titularEntidad.setNombre("Juan Ignacio");
        titularEntidad.setApellido("Perez");
        titularEntidad.setFechaNacimiento(LocalDate.of(2008, 6, 15));
        titularEntidad.setDireccion("San Martin 1234");
        titularEntidad.setGrupoSanguineo("A");
        titularEntidad.setFactorRh("+");
        titularEntidad.setDonanteOrganos(false);
        titularEntidad.setCreatedAt(LocalDateTime.now());

        responseDTO = new TitularResponseDTO();
        responseDTO.setId(1L);
        responseDTO.setTipoDocumento("DNI");
        responseDTO.setNumeroDocumento("50123456");
        responseDTO.setNombre("Juan Ignacio");
        responseDTO.setApellido("Perez");
        responseDTO.setFechaNacimiento(LocalDate.of(2008, 6, 15));
        responseDTO.setDireccion("San Martin 1234");
        responseDTO.setGrupoSanguineo("A");
        responseDTO.setFactorRh("+");
        responseDTO.setDonanteOrganos(false);
    }

    @Test
    void darDeAltaTitular_debeGuardarExitosamente_cuandoDatosCorrectos() {
        // Arrange
        when(titularRepository.existsByTipoDocumentoAndNumeroDocumento("DNI", "50123456")).thenReturn(false);
        when(titularMapper.toEntity(requestValido)).thenReturn(titularEntidad);
        when(titularRepository.save(titularEntidad)).thenReturn(titularEntidad);
        when(titularMapper.toResponseDTO(titularEntidad)).thenReturn(responseDTO);

        // Act
        TitularResponseDTO result = titularService.darDeAltaTitular(requestValido);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Juan Ignacio", result.getNombre());
        verify(titularRepository, times(1)).save(titularEntidad);
    }

    @Test
    void darDeAltaTitular_debeLanzarException_cuandoEsMenorDeEdad() {
        // Act & Assert
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            titularService.darDeAltaTitular(requestMenorDeEdad);
        });

        assertTrue(exception.getMessage().contains("El titular debe tener al menos 16 años"));
        verify(titularRepository, never()).save(any());
    }

    @Test
    void darDeAltaTitular_debeLanzarException_cuandoDocumentoDuplicado() {
        // Arrange
        when(titularRepository.existsByTipoDocumentoAndNumeroDocumento("DNI", "50123456")).thenReturn(true);

        // Act & Assert
        assertThrows(TitularDuplicadoException.class, () -> {
            titularService.darDeAltaTitular(requestValido);
        });

        verify(titularRepository, never()).save(any());
    }

    @Test
    void buscarPorId_debeRetornarTitular_cuandoExiste() {
        // Arrange
        when(titularRepository.findById(1L)).thenReturn(Optional.of(titularEntidad));
        when(titularMapper.toResponseDTO(titularEntidad)).thenReturn(responseDTO);

        // Act
        TitularResponseDTO result = titularService.buscarPorId(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(titularRepository, times(1)).findById(1L);
    }

    @Test
    void buscarPorId_debeLanzarException_cuandoNoExiste() {
        // Arrange
        when(titularRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(TitularNotFoundException.class, () -> {
            titularService.buscarPorId(99L);
        });
    }

    @Test
    void buscarPorDocumento_debeRetornarOptionalConTitular_cuandoExiste() {
        // Arrange
        when(titularRepository.findByTipoDocumentoAndNumeroDocumento("DNI", "50123456"))
                .thenReturn(Optional.of(titularEntidad));
        when(titularMapper.toResponseDTO(titularEntidad)).thenReturn(responseDTO);

        // Act
        Optional<TitularResponseDTO> result = titularService.buscarPorDocumento("DNI", "50123456");

        // Assert
        assertTrue(result.isPresent());
        assertEquals("Juan Ignacio", result.get().getNombre());
    }

    @Test
    void buscarPorDocumento_debeRetornarVacio_cuandoNoExiste() {
        // Arrange
        when(titularRepository.findByTipoDocumentoAndNumeroDocumento("DNI", "99999999"))
                .thenReturn(Optional.empty());

        // Act
        Optional<TitularResponseDTO> result = titularService.buscarPorDocumento("DNI", "99999999");

        // Assert
        assertTrue(result.isEmpty());
    }

    @Test
    void obtenerTodos_debeRetornarListaDeTitulares() {
        // Arrange
        when(titularRepository.findAll()).thenReturn(Collections.singletonList(titularEntidad));
        when(titularMapper.toResponseDTO(titularEntidad)).thenReturn(responseDTO);

        // Act
        List<TitularResponseDTO> result = titularService.obtenerTodos();

        // Assert
        assertEquals(1, result.size());
        assertEquals("Juan Ignacio", result.get(0).getNombre());
    }

    @Test
    void modificarTitular_debeActualizarDatos_cuandoExiste() {
        // Arrange
        TitularModificacionDTO modDTO = new TitularModificacionDTO(
                "Juan I.", "Perez Gomez", "Av. Alem 4321", "A", "-", true, null, null, null);
        
        Titular titularModificado = new Titular();
        titularModificado.setId(1L);
        titularModificado.setNombre("Juan I.");
        titularModificado.setApellido("Perez Gomez");
        titularModificado.setDireccion("Av. Alem 4321");
        titularModificado.setGrupoSanguineo("A");
        titularModificado.setFactorRh("-");
        titularModificado.setDonanteOrganos(true);

        TitularResponseDTO responseModDTO = new TitularResponseDTO();
        responseModDTO.setId(1L);
        responseModDTO.setNombre("Juan I.");
        responseModDTO.setApellido("Perez Gomez");

        when(titularRepository.findById(1L)).thenReturn(Optional.of(titularEntidad));
        when(titularRepository.save(any(Titular.class))).thenReturn(titularModificado);
        when(titularMapper.toResponseDTO(titularModificado)).thenReturn(responseModDTO);

        // Act
        TitularResponseDTO result = titularService.modificarTitular(1L, modDTO);

        // Assert
        assertNotNull(result);
        assertEquals("Juan I.", result.getNombre());
        assertEquals("Perez Gomez", result.getApellido());
        verify(titularRepository, times(1)).save(any(Titular.class));
    }

    @Test
    void modificarTitular_debeLanzarException_cuandoNoExiste() {
        // Arrange
        TitularModificacionDTO modDTO = new TitularModificacionDTO(
                "Juan I.", "Perez Gomez", "Av. Alem 4321", "A", "-", true, null, null, null);
        when(titularRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RecursoNoEncontradoException.class, () -> {
            titularService.modificarTitular(99L, modDTO);
        });
    }
}
