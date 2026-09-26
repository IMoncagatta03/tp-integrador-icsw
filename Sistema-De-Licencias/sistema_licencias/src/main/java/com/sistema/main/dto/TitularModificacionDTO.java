package com.sistema.main.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TitularModificacionDTO {
    private String nombre;
    private String apellido;
    private String direccion;
    private String grupoSanguineo;
    private String factorRh;
    private Boolean donanteOrganos;
    private String tipoDocumento;
    private String numeroDocumento;
    private java.time.LocalDate fechaNacimiento;
}