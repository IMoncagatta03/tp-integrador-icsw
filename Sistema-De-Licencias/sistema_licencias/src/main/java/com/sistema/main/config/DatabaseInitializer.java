package com.sistema.main.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import com.sistema.main.repository.ConfiguracionSistemaRepository;
import com.sistema.main.entity.ConfiguracionSistema;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DatabaseInitializer implements CommandLineRunner {

    private final ConfiguracionSistemaRepository repo;

    @Override
    public void run(String... args) throws Exception {
        repo.findById("COSTO_COPIA").ifPresentOrElse(config -> {
            if (config.getValor().compareTo(BigDecimal.valueOf(50.00)) != 0) {
                config.setValor(BigDecimal.valueOf(50.00));
                repo.save(config);
                System.out.println("Configuración COSTO_COPIA actualizada a 50.00");
            }
        }, () -> {
            repo.save(new ConfiguracionSistema("COSTO_COPIA", BigDecimal.valueOf(50.00), "Costo Modificación/Copia"));
            System.out.println("Configuración COSTO_COPIA creada con valor 50.00");
        });
    }
}
