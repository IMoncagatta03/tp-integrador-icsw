package com.sistema.main;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SistemaLicenciasApplication {

	public static void main(String[] args) {
		SpringApplication.run(SistemaLicenciasApplication.class, args);
	}

}
