package com.sistema.main.dto;

import java.time.LocalDate;

import com.sistema.main.entity.enums.ClaseLicencia;
import com.sistema.main.entity.enums.EstadoLicencia;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class LicenciaDTO {

    private Long id;
    private String nombreTitular;
    private String apellidoTitular;
    private String tipoDocumentoTitular;
    private String numeroDocumentoTitular;
    private String grupoSanguineoTitular;
    private String factorRhTitular;
    private Boolean donanteOrganosTitular;
    private ClaseLicencia clase;
    private LocalDate fechaInicio;
    private LocalDate fechaVencimiento;
    private EstadoLicencia estado;
    private String observaciones;

}
