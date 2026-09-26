package com.sistema.main.dto;

import com.sistema.main.entity.enums.ClaseLicencia;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

// DTO para representar el costo de una tarifa de licencia.
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TarifaDTO {

    private ClaseLicencia clase;
    private Integer vigenciaAnos;
    private BigDecimal costo;
}
