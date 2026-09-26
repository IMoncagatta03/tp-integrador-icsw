package com.sistema.main.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO de salida que representa la respuesta al cliente tras dar de alta un titular.
 */

@Getter
@Setter
@NoArgsConstructor
public class TitularResponseDTO {

    private Long id;
    private String tipoDocumento;
    private String numeroDocumento;
    private String apellido;
    private String nombre;
    private LocalDate fechaNacimiento;
    private String direccion;
    private String grupoSanguineo;
    private String factorRh;
    private Boolean donanteOrganos;
    private LocalDateTime createdAt;

}
