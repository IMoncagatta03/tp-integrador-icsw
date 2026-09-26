package com.sistema.main.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RenovacionLicenciaRequestDTO {
    private Long idLicenciaAnterior;
    private Integer vigenciaAnosNuevos;
    private String observaciones;
}
