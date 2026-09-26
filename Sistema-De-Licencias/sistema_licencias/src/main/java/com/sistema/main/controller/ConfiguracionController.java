package com.sistema.main.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sistema.main.dto.ConfiguracionDTO;
import com.sistema.main.dto.CostoLicenciaRequestDTO;
import com.sistema.main.dto.CostoLicenciaResponseDTO;
import com.sistema.main.dto.TarifaDTO;
import com.sistema.main.service.ConfiguracionService;
import com.sistema.main.util.FechaSimulada;

@RestController
@RequestMapping("/api/configuracion")
public class ConfiguracionController {

    private final ConfiguracionService configuracionService;
    private final FechaSimulada fechaSimulada;

    public ConfiguracionController(ConfiguracionService configuracionService, FechaSimulada fechaSimulada) {
        this.configuracionService = configuracionService;
        this.fechaSimulada = fechaSimulada;
    }

    // Obtiene la fecha simulada actual del sistema.
    @GetMapping("/fecha-sistema")
    public ResponseEntity<Map<String, String>> obtenerFechaSistema() {
        Map<String, String> response = new HashMap<>();
        response.put("fecha", fechaSimulada.getLocalDate().toString());
        return ResponseEntity.ok(response);
    }

    // Obtiene todas las variables de configuración.
    @GetMapping
    public ResponseEntity<List<ConfiguracionDTO>> obtenerConfiguraciones() {
        return ResponseEntity.ok(configuracionService.obtenerConfiguraciones());
    }

    // Actualiza en lote las variables de configuración.
    @PutMapping
    public ResponseEntity<Void> actualizarConfiguraciones(@RequestBody List<ConfiguracionDTO> configuraciones) {
        configuracionService.actualizarConfiguraciones(configuraciones);
        return ResponseEntity.ok().build();
    }

    // Obtiene todas las tarifas de licencias.
    @GetMapping("/tarifas")
    public ResponseEntity<List<TarifaDTO>> obtenerTarifas() {
        return ResponseEntity.ok(configuracionService.obtenerTarifas());
    }

    // Actualiza en lote las tarifas de licencias.
    @PutMapping("/tarifas")
    public ResponseEntity<Void> actualizarTarifas(@RequestBody List<TarifaDTO> tarifas) {
        configuracionService.actualizarTarifas(tarifas);
        return ResponseEntity.ok().build();
    }

    // Calcula el costo de una licencia según la clase y vigencia proporcionadas.
    @PostMapping("/calcular-costo")
    public ResponseEntity<CostoLicenciaResponseDTO> calcularCostoLicencia(
            @RequestBody CostoLicenciaRequestDTO requestDTO) {

        CostoLicenciaResponseDTO desgloseCosto = configuracionService.calcularCostoLicencia(requestDTO);
        return ResponseEntity.ok(desgloseCosto);
    }

}
