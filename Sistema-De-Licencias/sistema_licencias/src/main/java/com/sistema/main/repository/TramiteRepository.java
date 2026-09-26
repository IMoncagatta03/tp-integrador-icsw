package com.sistema.main.repository;

import com.sistema.main.entity.Tramite;
import com.sistema.main.entity.Licencia;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

// Repositorio de datos para la entidad Tramite.
public interface TramiteRepository extends JpaRepository<Tramite, Long> {
    List<Tramite> findByLicencia(Licencia licencia);
}
