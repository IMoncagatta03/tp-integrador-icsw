package com.sistema.main.repository;

import com.sistema.main.entity.TarifaLicencia;
import com.sistema.main.entity.TarifaLicenciaId;
import org.springframework.data.jpa.repository.JpaRepository;

// Repositorio de datos para la entidad TarifaLicencia.
public interface TarifaLicenciaRepository extends JpaRepository<TarifaLicencia, TarifaLicenciaId> {
}
