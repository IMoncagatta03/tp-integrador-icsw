package com.sistema.main.service;

import com.sistema.main.dto.ConfiguracionDTO;
import com.sistema.main.dto.CostoLicenciaRequestDTO;
import com.sistema.main.dto.CostoLicenciaResponseDTO;
import com.sistema.main.dto.TarifaDTO;
import java.util.List;

// Interfaz para gestionar la configuración y las tarifas de licencias.
public interface ConfiguracionService {

    // Obtiene todas las variables de configuración global.
    List<ConfiguracionDTO> obtenerConfiguraciones();

    // Actualiza en lote las variables de configuración global.
    void actualizarConfiguraciones(List<ConfiguracionDTO> configuraciones);

    // Obtiene todas las tarifas de licencias.
    List<TarifaDTO> obtenerTarifas();

    // Actualiza en lote las tarifas de licencias.
    void actualizarTarifas(List<TarifaDTO> tarifas);

    CostoLicenciaResponseDTO calcularCostoLicencia(CostoLicenciaRequestDTO request);
}
