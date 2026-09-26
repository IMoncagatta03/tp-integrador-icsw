package com.sistema.main.util;

import com.sistema.main.repository.ConfiguracionSistemaRepository;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Componente que calcula la fecha actual del sistema considerando un desvío (offset)
 * de días configurado en la base de datos para simular el avance del tiempo en entornos de prueba.
 */
@Component
public class FechaSimulada {

    private final ConfiguracionSistemaRepository configuracionRepository;

    public FechaSimulada(ConfiguracionSistemaRepository configuracionRepository) {
        this.configuracionRepository = configuracionRepository;
    }

    /**
     * Retorna la fecha simulada actual.
     */
    public LocalDate getLocalDate() {
        return configuracionRepository.findById("FECHA_SIMULADA_DIAS_OFFSET")
                .map(config -> LocalDate.now().plusDays(config.getValor().longValue()))
                .orElse(LocalDate.now());
    }

    /**
     * Retorna la fecha y hora simuladas actuales.
     */
    public LocalDateTime getLocalDateTime() {
        return configuracionRepository.findById("FECHA_SIMULADA_DIAS_OFFSET")
                .map(config -> LocalDateTime.now().plusDays(config.getValor().longValue()))
                .orElse(LocalDateTime.now());
    }
}
