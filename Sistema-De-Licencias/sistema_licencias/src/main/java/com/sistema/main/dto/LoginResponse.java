package com.sistema.main.dto;

import com.sistema.main.entity.enums.RolUsuario; // <--- Importamos el nuevo Enum
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    private Long id;
    private String username;
    private String nombre;
    private String apellido;
    private RolUsuario rol; // <--- Cambiado de TipoRol a RolUsuario
}