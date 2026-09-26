package com.sistema.main.service.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.sistema.main.dto.ConfiguracionDTO;
import com.sistema.main.dto.CostoLicenciaRequestDTO;
import com.sistema.main.dto.CostoLicenciaResponseDTO;
import com.sistema.main.dto.TarifaDTO;
import com.sistema.main.entity.ConfiguracionSistema;
import com.sistema.main.entity.TarifaLicencia;
import com.sistema.main.entity.TarifaLicenciaId;
import com.sistema.main.exception.RecursoNoEncontradoException;
import com.sistema.main.repository.ConfiguracionSistemaRepository;
import com.sistema.main.repository.LicenciaRepository;
import com.sistema.main.repository.TarifaLicenciaRepository;
import com.sistema.main.service.ConfiguracionService;

import lombok.RequiredArgsConstructor;

// Implementación del servicio de configuración y tarifas.
@Service
@RequiredArgsConstructor
public class ConfiguracionServiceImpl implements ConfiguracionService {

    private final ConfiguracionSistemaRepository configuracionRepository;
    private final TarifaLicenciaRepository tarifaRepository;
    private final LicenciaRepository licenciaRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ConfiguracionDTO> obtenerConfiguraciones() {
        return configuracionRepository.findAll().stream()
                .map(c -> new ConfiguracionDTO(c.getClave(), c.getValor(), c.getDescripcion()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void actualizarConfiguraciones(List<ConfiguracionDTO> configuraciones) {
        BigDecimal anteriorOffset = configuracionRepository.findById("FECHA_SIMULADA_DIAS_OFFSET")
                .map(c -> c.getValor())
                .orElse(BigDecimal.ZERO);
        BigDecimal nuevoOffset = null;

        for (ConfiguracionDTO dto : configuraciones) {
            ConfiguracionSistema config = configuracionRepository.findById(dto.getClave())
                    .orElseGet(() -> new ConfiguracionSistema(dto.getClave(), dto.getValor(), dto.getDescripcion()));
            config.setValor(dto.getValor());
            configuracionRepository.save(config);

            if ("FECHA_SIMULADA_DIAS_OFFSET".equals(dto.getClave())) {
                nuevoOffset = dto.getValor();
            }
        }

        // Si el offset cambió, se ejecuta la verificación de licencias
        if (nuevoOffset != null && anteriorOffset.compareTo(nuevoOffset) != 0) {
            LocalDate hoySimulado = LocalDate.now().plusDays(nuevoOffset.longValue());
            // Si vuelve a cero, se revierten las licencias expiradas que ahora están vigentes
            if (nuevoOffset.compareTo(BigDecimal.ZERO) == 0) {
                licenciaRepository.revertirEstadosExpirados(hoySimulado);
            }
            licenciaRepository.actualizarEstadosExpirados(hoySimulado);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<TarifaDTO> obtenerTarifas() {
        return tarifaRepository.findAll().stream()
                .map(t -> new TarifaDTO(t.getId().getClase(), t.getId().getVigenciaAnos(), t.getCosto()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void actualizarTarifas(List<TarifaDTO> tarifas) {
        for (TarifaDTO dto : tarifas) {
            TarifaLicenciaId id = new TarifaLicenciaId(dto.getClase(), dto.getVigenciaAnos());
            TarifaLicencia tarifa = tarifaRepository.findById(id)
                    .orElseThrow(() -> new RecursoNoEncontradoException("Tarifa no encontrada para Clase " 
                            + dto.getClase() + " y Vigencia " + dto.getVigenciaAnos() + " años."));
            tarifa.setCosto(dto.getCosto());
            tarifaRepository.save(tarifa);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public CostoLicenciaResponseDTO calcularCostoLicencia(CostoLicenciaRequestDTO request) {
        // 1. Buscamos el costo base en la tabla de tarifas usando la ID compuesta (Clase + Años)
        TarifaLicenciaId tarifaId = new TarifaLicenciaId(request.getClase(), request.getVigenciaAnos());
        
        TarifaLicencia tarifa = tarifaRepository.findById(tarifaId)
                .orElseThrow(() -> new RecursoNoEncontradoException("No se encontró una tarifa vigente para la Clase " 
                        + request.getClase() + " con una vigencia de " + request.getVigenciaAnos() + " años."));

        BigDecimal costoTarifa = tarifa.getCosto();

        // 2. Buscamos el valor de los gastos administrativos en la configuración global del sistema
        // Si por algún motivo no existe en la BD, usamos el valor por defecto del enunciado ($8) como fallback
        BigDecimal gastosAdministrativos = configuracionRepository.findById("GASTOS_ADMINISTRATIVOS")
                .map(c -> c.getValor())
                .orElse(new BigDecimal("8.00"));

        // 3. Calculamos el monto total final
        BigDecimal costoTotal = costoTarifa.add(gastosAdministrativos);

        // 4. Retornamos el DTO de respuesta con el desglose completo
        return new CostoLicenciaResponseDTO(costoTarifa, gastosAdministrativos, costoTotal);
    }
    
}
