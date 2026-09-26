package com.sistema.main.repository;

import com.sistema.main.entity.ConfiguracionSistema;
import org.springframework.data.jpa.repository.JpaRepository;

// Repositorio de datos para la configuración del sistema.
public interface ConfiguracionSistemaRepository extends JpaRepository<ConfiguracionSistema, String> {
}
