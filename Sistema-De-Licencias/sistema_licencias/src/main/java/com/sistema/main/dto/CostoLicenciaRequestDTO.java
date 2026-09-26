package com.sistema.main.dto;

import com.sistema.main.entity.enums.ClaseLicencia;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CostoLicenciaRequestDTO {
    private ClaseLicencia clase;
    private Integer vigenciaAnos;
}