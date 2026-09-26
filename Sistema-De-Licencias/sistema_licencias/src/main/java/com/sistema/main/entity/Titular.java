package com.sistema.main.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Entidad que representa al titular de una licencia de conducir.
 */
@Entity
@Table(
    name = "titulares",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_titular_documento",
        columnNames = {"tipo_documento", "numero_documento"}
    )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Titular {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tipo_documento", nullable = false, length = 10)
    private String tipoDocumento;

    @Column(name = "numero_documento", nullable = false, length = 20)
    private String numeroDocumento;

    @Column(nullable = false, length = 100)
    private String apellido;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(name = "fecha_nacimiento", nullable = false)
    private LocalDate fechaNacimiento;

    @Column(nullable = false, length = 255)
    private String direccion;

    @Column(name = "grupo_sanguineo", nullable = false, length = 3)
    private String grupoSanguineo;

    @Column(name = "factor_rh", nullable = false, length = 2)
    private String factorRh;

    @Column(name = "donante_organos", nullable = false)
    private boolean donanteOrganos;

    @Column(name = "created_at", insertable = false, updatable = false,
            columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;
}
