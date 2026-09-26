package com.sistema.main.dto;

import com.sistema.main.entity.enums.RolUsuario;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioNuevoDTO {

    private String username;
    private String password;
    private String nombre;
    private String apellido;
    private RolUsuario rol; // Para definir si se da de alta como ADMINISTRATIVO o ADMINISTRADOR
    private Boolean activo;
}