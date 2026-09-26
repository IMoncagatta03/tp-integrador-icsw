package com.sistema.main.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// DTO para representar una variable de configuración.
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ConfiguracionDTO {

    private String clave;
    private BigDecimal valor;
    private String descripcion;

}
