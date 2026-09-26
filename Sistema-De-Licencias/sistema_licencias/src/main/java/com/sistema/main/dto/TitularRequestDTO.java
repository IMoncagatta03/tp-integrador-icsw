package com.sistema.main.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * DTO de entrada para el alta de un titular.
 * Sin dependencia de Lombok para evitar problemas con el procesador de anotaciones.
 */
@Getter
@Setter
@NoArgsConstructor
public class TitularRequestDTO {

    @NotBlank(message = "El tipo de documento es obligatorio")
    @Size(max = 10, message = "El tipo de documento no debe superar los 10 caracteres")
    private String tipoDocumento;

    @NotBlank(message = "El número de documento es obligatorio")
    @Size(max = 20, message = "El número de documento no debe superar los 20 caracteres")
    @Pattern(regexp = "^[a-zA-Z0-9]+$", message = "El número de documento debe ser alfanumérico")
    private String numeroDocumento;

    @NotBlank(message = "El apellido es obligatorio")
    @Size(max = 100, message = "El apellido no debe superar los 100 caracteres")
    private String apellido;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no debe superar los 100 caracteres")
    private String nombre;

    @NotNull(message = "La fecha de nacimiento es obligatoria")
    @Past(message = "La fecha de nacimiento debe ser en el pasado")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate fechaNacimiento;

    @NotBlank(message = "La dirección es obligatoria")
    @Size(max = 255, message = "La dirección no debe superar los 255 caracteres")
    private String direccion;

    @NotBlank(message = "El grupo sanguíneo es obligatorio")
    @Pattern(regexp = "^(?i)(A|B|AB|O)$", message = "El grupo sanguíneo debe ser A, B, AB u O")
    private String grupoSanguineo;

    @NotBlank(message = "El factor RH es obligatorio")
    @Pattern(regexp = "^([+\\-])$", message = "El factor RH debe ser + o -")
    private String factorRh;

    @NotNull(message = "Debe especificar si es donante de órganos")
    private Boolean donanteOrganos;

}
