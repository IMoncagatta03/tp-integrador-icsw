package com.sistema.main.service.impl;

import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;
import com.sistema.main.dto.UsuarioNuevoDTO;
import com.sistema.main.entity.Usuario;
import com.sistema.main.entity.enums.RolUsuario;
import com.sistema.main.repository.UsuarioRepository;
import com.sistema.main.service.UsuarioService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public Usuario darDeAltaUsuario(UsuarioNuevoDTO nuevoUsuarioDTO, Long idUsuarioOperador) {
        // 1. Buscamos al usuario que está intentando hacer la acción
        Usuario operador = usuarioRepository.findById(idUsuarioOperador)
                .orElseThrow(() -> new RuntimeException("Error: El usuario operador no existe."));

        // 2. Restricción de seguridad: Solo el operador con rol ADMINISTRATIVO puede crear usuarios
        if (operador.getRol() != RolUsuario.ADMINISTRATIVO) {
            throw new RuntimeException("Error: No posee privilegios de administrativo para dar de alta usuarios.");
        }

        // 3. Si pasa la validación, se procede a guardar el nuevo usuario
        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setUsername(nuevoUsuarioDTO.getUsername());
        nuevoUsuario.setNombre(nuevoUsuarioDTO.getNombre());
        nuevoUsuario.setApellido(nuevoUsuarioDTO.getApellido());
        
        // Encriptamos la contraseña usando BCrypt
        String hashPassword = BCrypt.hashpw(nuevoUsuarioDTO.getPassword(), BCrypt.gensalt());
        nuevoUsuario.setPasswordHash(hashPassword);
        
        nuevoUsuario.setRol(nuevoUsuarioDTO.getRol()); // ADMINISTRATIVO o ADMINISTRADOR
        nuevoUsuario.setActivo(true); // Siempre activo al dar de alta

        return usuarioRepository.save(nuevoUsuario);
    }

    @Override
    @Transactional
    public Usuario modificarUsuario(Long idUsuarioAModificar, UsuarioNuevoDTO dto, Long idUsuarioOperador) {
        // 1. Validación de privilegios del operador
        Usuario operador = usuarioRepository.findById(idUsuarioOperador)
                .orElseThrow(() -> new RuntimeException("Error: El usuario operador no existe."));

        if (operador.getRol() != RolUsuario.ADMINISTRATIVO) {
            throw new RuntimeException("Error: No posee privilegios de administrativo para modificar usuarios.");
        }

        // 2. Buscar al usuario a modificar
        Usuario usuarioAModificar = usuarioRepository.findById(idUsuarioAModificar)
                .orElseThrow(() -> new RuntimeException("Error: El usuario con ID " + idUsuarioAModificar + " no existe."));

        // 3. Pisamos los datos comunes
        usuarioAModificar.setNombre(dto.getNombre());
        usuarioAModificar.setApellido(dto.getApellido());
        usuarioAModificar.setRol(dto.getRol());
        usuarioAModificar.setActivo(dto.getActivo() != null ? dto.getActivo() : true);

        // ⚠️ CONTROL CRÍTICO: Solo cambiamos la contraseña si mandaron una nueva en el JSON
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            String nuevoHash = BCrypt.hashpw(dto.getPassword(), BCrypt.gensalt());
            usuarioAModificar.setPasswordHash(nuevoHash);
        }

        return usuarioRepository.save(usuarioAModificar);
    }

    @Override
    @Transactional
    public java.util.List<Usuario> listarUsuarios(Long idUsuarioOperador) {
        Usuario operador = usuarioRepository.findById(idUsuarioOperador)
                .orElseThrow(() -> new RuntimeException("Error: El usuario operador no existe."));

        if (operador.getRol() != RolUsuario.ADMINISTRATIVO) {
            throw new RuntimeException("Error: No posee privilegios de administrativo para listar usuarios.");
        }

        return usuarioRepository.findAll();
    }

    @Override
    @Transactional
    public Usuario obtenerUsuarioPorId(Long id, Long idUsuarioOperador) {
        Usuario operador = usuarioRepository.findById(idUsuarioOperador)
                .orElseThrow(() -> new RuntimeException("Error: El usuario operador no existe."));

        if (operador.getRol() != RolUsuario.ADMINISTRATIVO) {
            throw new RuntimeException("Error: No posee privilegios de administrativo para obtener usuarios.");
        }

        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: El usuario con ID " + id + " no existe."));
    }

}
