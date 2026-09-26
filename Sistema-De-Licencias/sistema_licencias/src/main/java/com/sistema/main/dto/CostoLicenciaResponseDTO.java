package com.sistema.main.dto;

import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CostoLicenciaResponseDTO {
    private BigDecimal costoTarifa;
    private BigDecimal gastosAdministrativos;
    private BigDecimal costoTotal;
}