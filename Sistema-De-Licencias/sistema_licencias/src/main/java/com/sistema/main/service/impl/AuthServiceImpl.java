package com.sistema.main.service.impl;

import com.sistema.main.dto.LoginRequest;
import com.sistema.main.dto.LoginResponse;
import com.sistema.main.entity.Usuario;
import com.sistema.main.repository.UsuarioRepository;
import com.sistema.main.service.AuthService;

import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UsuarioRepository usuarioRepository;

    @Override
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest loginRequest) {
        Usuario usuario = usuarioRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Usuario o contraseña incorrectos."));

        if (!usuario.getActivo()) {
            throw new IllegalArgumentException("el usuario no esta activo");
        }

        if (!BCrypt.checkpw(loginRequest.getPassword(), usuario.getPasswordHash())) {
            throw new IllegalArgumentException("Usuario o contraseña incorrectos.");
        }

        // 1. Creás el objeto vacío
        LoginResponse response = new LoginResponse();

        // 2. Le cargás cada uno de los datos que recuperaste de la base de datos
        response.setId(usuario.getId());
        response.setUsername(usuario.getUsername());
        response.setNombre(usuario.getNombre());
        response.setApellido(usuario.getApellido());
        response.setRol(usuario.getRol());

        // 3. Recién ahí lo retornás completo
        return response;
    }
}
