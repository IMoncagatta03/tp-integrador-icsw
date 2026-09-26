package com.sistema.main.repository;

import com.sistema.main.entity.Titular;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Repositorio JPA para la entidad Titular.
 */
public interface TitularRepository extends JpaRepository<Titular, Long> {

    /**
     * Verifica si ya existe un titular con el mismo tipo y número de documento.
     */
    boolean existsByTipoDocumentoAndNumeroDocumento(String tipoDocumento, String numeroDocumento);

    /**
     * Busca un titular por tipo y número de documento.
     */
    Optional<Titular> findByTipoDocumentoAndNumeroDocumento(String tipoDocumento, String numeroDocumento);
}
