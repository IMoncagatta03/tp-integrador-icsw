package com.sistema.main.service;

import com.sistema.main.dto.UsuarioNuevoDTO;
import com.sistema.main.entity.Usuario;

public interface UsuarioService {

    public Usuario darDeAltaUsuario(UsuarioNuevoDTO nuevoUsuarioDTO, Long idUsuarioOperador);

    public Usuario modificarUsuario(Long idUsuarioAModificar, UsuarioNuevoDTO dto, Long idUsuarioOperador);

    public java.util.List<Usuario> listarUsuarios(Long idUsuarioOperador);

    public Usuario obtenerUsuarioPorId(Long id, Long idUsuarioOperador);

}
