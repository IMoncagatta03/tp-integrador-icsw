package com.sistema.main.service.impl;

import com.sistema.main.dto.TitularModificacionDTO;
import com.sistema.main.dto.TitularRequestDTO;
import com.sistema.main.dto.TitularResponseDTO;
import com.sistema.main.exception.RecursoNoEncontradoException;
import com.sistema.main.exception.TitularDuplicadoException;
import com.sistema.main.exception.TitularNotFoundException;
import com.sistema.main.mapper.TitularMapper;
import com.sistema.main.entity.Titular;
import com.sistema.main.repository.TitularRepository;
import com.sistema.main.service.TitularService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.time.Period;
import java.util.Optional;

/**
 * Implementación del servicio de titulares.
 * Contiene la lógica de negocio para el alta y consulta de titulares.
 */
@Service
@RequiredArgsConstructor
public class TitularServiceImpl implements TitularService {

    private static final int EDAD_MINIMA = 16;

    private final TitularRepository titularRepository;
    private final TitularMapper titularMapper;
    private final com.sistema.main.util.FechaSimulada fechaSimulada;

    /**
     * Da de alta un nuevo titular aplicando validaciones de negocio.
     *
     * Validaciones:
     * 1. El titular debe tener al menos 16 años.
     * 2. No puede existir otro titular con el mismo tipo y número de documento.
     */
    @Override
    @Transactional
    public TitularResponseDTO darDeAltaTitular(TitularRequestDTO dto) {
        // 1. Validar edad mínima
        validarEdadMinima(dto.getFechaNacimiento());

        // 2. Verificar que no exista un titular con el mismo documento
        String tipoDocNormalizado = dto.getTipoDocumento().trim().toUpperCase();
        String numeroDocNormalizado = dto.getNumeroDocumento().trim().toUpperCase();
        if (titularRepository.existsByTipoDocumentoAndNumeroDocumento(
                tipoDocNormalizado, numeroDocNormalizado)) {
            throw new TitularDuplicadoException(tipoDocNormalizado, numeroDocNormalizado);
        }

        // 3. Convertir DTO a entidad y persistir
        Titular titular = titularMapper.toEntity(dto);
        Titular titularGuardado = titularRepository.save(titular);

        // 4. Retornar DTO de respuesta
        return titularMapper.toResponseDTO(titularGuardado);
    }

    @Override
    @Transactional(readOnly = true)
    public TitularResponseDTO buscarPorId(Long id) {
        Titular titular = titularRepository.findById(id)
                .orElseThrow(() -> new TitularNotFoundException(id));
        return titularMapper.toResponseDTO(titular);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<TitularResponseDTO> buscarPorDocumento(String tipoDocumento, String numeroDocumento) {
        return titularRepository
                .findByTipoDocumentoAndNumeroDocumento(
                        tipoDocumento.trim().toUpperCase(),
                        numeroDocumento.trim().toUpperCase())
                .map(titularMapper::toResponseDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<TitularResponseDTO> obtenerTodos() {
        return titularRepository.findAll().stream()
                .map(titularMapper::toResponseDTO)
                .toList();
    }

    // ─────────────────────────────────────────────
    // Métodos privados de validación
    // ─────────────────────────────────────────────

    /**
     * Verifica que el titular tenga al menos EDAD_MINIMA años.
     *
     * @throws IllegalArgumentException si la persona es menor de la edad mínima
     *                                  requerida
     */
    private void validarEdadMinima(LocalDate fechaNacimiento) {
        int edad = Period.between(fechaNacimiento, fechaSimulada.getLocalDate()).getYears();
        if (edad < EDAD_MINIMA) {
            throw new IllegalArgumentException(
                    String.format("El titular debe tener al menos %d años para obtener una licencia. " +
                            "Edad actual: %d años.", EDAD_MINIMA, edad));
        }
    }

    @Override
    @Transactional
    public TitularResponseDTO modificarTitular(Long idTitular, TitularModificacionDTO dto){
        Titular titular = titularRepository.findById(idTitular)
                .orElseThrow(() -> new RecursoNoEncontradoException("No se encontró el titular con ID: " + idTitular));

        // Validar edad mínima si cambió la fecha de nacimiento
        if (dto.getFechaNacimiento() != null) {
            validarEdadMinima(dto.getFechaNacimiento());
            titular.setFechaNacimiento(dto.getFechaNacimiento());
        }

        // Validar documento duplicado si cambió el documento
        if (dto.getTipoDocumento() != null && dto.getNumeroDocumento() != null) {
            String tipoDocNormalizado = dto.getTipoDocumento().trim().toUpperCase();
            String numeroDocNormalizado = dto.getNumeroDocumento().trim().toUpperCase();
            if (!titular.getTipoDocumento().equalsIgnoreCase(tipoDocNormalizado) ||
                !titular.getNumeroDocumento().equalsIgnoreCase(numeroDocNormalizado)) {
                if (titularRepository.existsByTipoDocumentoAndNumeroDocumento(tipoDocNormalizado, numeroDocNormalizado)) {
                    throw new TitularDuplicadoException(tipoDocNormalizado, numeroDocNormalizado);
                }
                titular.setTipoDocumento(tipoDocNormalizado);
                titular.setNumeroDocumento(numeroDocNormalizado);
            }
        }

        titular.setNombre(dto.getNombre().trim());
        titular.setApellido(dto.getApellido().trim());
        titular.setDireccion(dto.getDireccion().trim());
        titular.setGrupoSanguineo(dto.getGrupoSanguineo());
        titular.setFactorRh(dto.getFactorRh());
        titular.setDonanteOrganos(dto.getDonanteOrganos());

        Titular titularActualizado = titularRepository.save(titular);

        // Reutilizamos el mapper que ya devuelve TitularResponseDTO
        return titularMapper.toResponseDTO(titularActualizado); 
    }

}
