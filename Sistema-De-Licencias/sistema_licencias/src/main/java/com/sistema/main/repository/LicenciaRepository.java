package com.sistema.main.repository;

import com.sistema.main.entity.Licencia;
import com.sistema.main.entity.Titular;
import java.util.List;
import java.time.LocalDate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

// Repositorio de datos para la entidad Licencia.
public interface LicenciaRepository extends JpaRepository<Licencia, Long> {
    
    // Busca todo el historial de licencias de un titular específico
    List<Licencia> findByTitular(Titular titular);

    // Actualiza de forma masiva las licencias vencidas a EXPIRADA.
    @Modifying
    @Query(value = "UPDATE licencias SET estado = 'EXPIRADA' WHERE fecha_vencimiento < :fecha AND estado = 'VIGENTE'", nativeQuery = true)
    int actualizarEstadosExpirados(@Param("fecha") LocalDate fecha);

    // Revierte licencias expiradas falsamente a VIGENTE.
    @Modifying
    @Query(value = "UPDATE licencias l SET estado = 'VIGENTE' WHERE l.fecha_vencimiento >= :fecha AND l.estado = 'EXPIRADA' AND NOT EXISTS (SELECT 1 FROM licencias l2 WHERE l2.titular_id = l.titular_id AND l2.clase = l.clase AND l2.id > l.id)", nativeQuery = true)
    int revertirEstadosExpirados(@Param("fecha") LocalDate fecha);

    List<Licencia> findByFechaVencimientoBefore(LocalDate fecha);

      /**
     * MAS-XX: Búsqueda avanzada de licencias vigentes por múltiples criterios del titular.
     * Si un parámetro viene nulo o vacío, el "OR :param IS NULL" hace que se ignore ese filtro.
     */
    @Query(value = "SELECT l.* FROM licencias l JOIN titulares t ON t.id = l.titular_id WHERE l.estado = 'VIGENTE'::estado_licencia " +
           "AND (:nombre IS NULL OR LOWER(t.nombre) LIKE LOWER(CONCAT('%', :nombre, '%')) OR LOWER(t.apellido) LIKE LOWER(CONCAT('%', :nombre, '%'))) " +
           "AND (:grupoSanguineo IS NULL OR t.grupo_sanguineo = :grupoSanguineo) " +
           "AND (:factorRh IS NULL OR t.factor_rh = :factorRh) " +
           "AND (:donante IS NULL OR t.donante_organos = :donante)", nativeQuery = true)
    List<Licencia> buscarVigentesPorCriterios(
            @Param("nombre") String nombre,
            @Param("grupoSanguineo") String grupoSanguineo,
            @Param("factorRh") String factorRh,
            @Param("donante") Boolean donante);
}
