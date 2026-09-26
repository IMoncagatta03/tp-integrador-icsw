package com.sistema.main.service;

import com.sistema.main.repository.LicenciaRepository;
import com.sistema.main.util.FechaSimulada;
import java.time.LocalDate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

// Componente para programar tareas automáticas de licencias.
@Component
public class LicenciaScheduler {

    private static final Logger log = LoggerFactory.getLogger(LicenciaScheduler.class);
    private final LicenciaRepository licenciaRepository;
    private final FechaSimulada fechaSimulada;

    public LicenciaScheduler(LicenciaRepository licenciaRepository, FechaSimulada fechaSimulada) {
        this.licenciaRepository = licenciaRepository;
        this.fechaSimulada = fechaSimulada;
    }

    // Proceso automático diario que expira licencias vencidas a las 2:00 AM.
    @Scheduled(cron = "0 0 2 * * ?")

    @Transactional
    public void expirarLicenciasVencidas() {
        log.info("Iniciando proceso automático de expiración de licencias...");
        LocalDate hoy = fechaSimulada.getLocalDate();
        int actualizadas = licenciaRepository.actualizarEstadosExpirados(hoy);
        log.info("Proceso finalizado. Se expiraron {} licencias.", actualizadas);
    }
}
