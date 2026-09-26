package com.sistema.main.entity;

import com.sistema.main.entity.enums.ClaseLicencia;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.io.Serializable;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;

// Clave primaria compuesta para la tabla tarifas_licencia.
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class TarifaLicenciaId implements Serializable {

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "clase", nullable = false)
    private ClaseLicencia clase;

    @Column(name = "vigencia_anos", nullable = false)
    private Integer vigenciaAnos;
}
