package com.sistema.main.entity;

import com.sistema.main.entity.enums.TipoTramite;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

// Entidad que representa la auditoría del trámite de una licencia.
@Entity
@Table(name = "tramites")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Tramite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "licencia_id", nullable = false, foreignKey = @ForeignKey(name = "fk_tramites_licencia"))
    private Licencia licencia;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false, foreignKey = @ForeignKey(name = "fk_tramites_usuario"))
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "tipo_tramite", nullable = false)
    private TipoTramite tipoTramite;

    @Column(name = "fecha_tramite", nullable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime fechaTramite = LocalDateTime.now();

    @Column(name = "costo_base", nullable = false, precision = 10, scale = 2)
    private BigDecimal costoBase;

    @Column(name = "gastos_administrativos", nullable = false, precision = 10, scale = 2)
    private BigDecimal gastosAdministrativos = new BigDecimal("8.00");

    @Column(name = "costo_total", insertable = false, updatable = false, precision = 10, scale = 2)
    private BigDecimal costoTotal;
}
