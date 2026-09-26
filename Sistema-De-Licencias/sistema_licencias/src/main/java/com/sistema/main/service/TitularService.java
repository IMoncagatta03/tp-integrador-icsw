package com.sistema.main.service;

import com.sistema.main.dto.TitularModificacionDTO;
import com.sistema.main.dto.TitularRequestDTO;
import com.sistema.main.dto.TitularResponseDTO;

import java.util.Optional;

/**
 * Interfaz del servicio de titulares.
 * Define las operaciones de negocio disponibles.
 */
public interface TitularService {

    /**
     * Da de alta un nuevo titular en el sistema.
     *
     * @param dto Datos del titular a registrar
     * @return DTO con los datos del titular persistido (incluyendo ID y fechaAlta)
     * @throws com.sistema.main.exception.TitularDuplicadoException si ya existe un titular con ese documento
     * @throws IllegalArgumentException si el titular es menor de 16 años
     */
    TitularResponseDTO darDeAltaTitular(TitularRequestDTO dto);

    /**
     * Busca un titular por su ID.
     *
     * @param id ID del titular
     * @return DTO del titular encontrado
     * @throws com.sistema.main.exception.TitularNotFoundException si no existe
     */
    TitularResponseDTO buscarPorId(Long id);

    /**
     * Busca un titular por tipo y número de documento.
     *
     * @param tipoDocumento Tipo de documento
     * @param numeroDocumento Número de documento
     * @return Optional con el DTO del titular si existe
     */
    Optional<TitularResponseDTO> buscarPorDocumento(String tipoDocumento, String numeroDocumento);

    java.util.List<TitularResponseDTO> obtenerTodos();

    TitularResponseDTO modificarTitular(Long idTitular, TitularModificacionDTO dto);
}
