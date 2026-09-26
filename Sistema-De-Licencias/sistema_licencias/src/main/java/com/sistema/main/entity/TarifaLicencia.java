package com.sistema.main.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

// Entidad que representa la tarifa parametrizada de una licencia de conducir.
@Entity
@Table(name = "tarifas_licencia")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TarifaLicencia {

    @EmbeddedId
    private TarifaLicenciaId id;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal costo;
}
