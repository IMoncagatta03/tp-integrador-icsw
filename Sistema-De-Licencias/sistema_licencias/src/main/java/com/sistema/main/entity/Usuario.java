package com.sistema.main.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Getter; // <--- AGREGADO
import lombok.Setter; // <--- AGREGADO
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;
import com.sistema.main.entity.enums.RolUsuario;

// Entidad que representa a los usuarios del sistema.
@Entity
@Table(name = "usuarios")
@Getter // <--- AGREGADO: Genera los métodos getId(), getUsername(), etc.
@Setter // <--- AGREGADO: Genera los métodos setUsername(), setActivo(), etc.
@AllArgsConstructor
@NoArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(nullable = false, length = 100)
    private String apellido;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, length = 20)
    private RolUsuario rol = RolUsuario.ADMINISTRATIVO;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "created_at", insertable = false, updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

}

