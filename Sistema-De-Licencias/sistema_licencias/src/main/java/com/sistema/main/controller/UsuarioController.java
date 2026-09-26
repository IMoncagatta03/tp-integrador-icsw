package com.sistema.main.controller;

import com.sistema.main.dto.UsuarioNuevoDTO;
import com.sistema.main.entity.Usuario;
import com.sistema.main.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @PostMapping
    public ResponseEntity<Usuario> darDeAltaUsuario(
            @RequestBody UsuarioNuevoDTO nuevoUsuarioDTO,
            @RequestHeader("X-Usuario-Operador-Id") Long idUsuarioOperador) {

        Usuario usuarioCreado = usuarioService.darDeAltaUsuario(nuevoUsuarioDTO, idUsuarioOperador);

        // Devolvemos un 200 OK con los datos del usuario recién guardado en PostgreSQL
        return ResponseEntity.ok(usuarioCreado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Usuario> modificarUsuario(
            @PathVariable Long id,
            @RequestBody UsuarioNuevoDTO modificacionDTO,
            @RequestHeader("X-Usuario-Operador-Id") Long idUsuarioOperador) {

        Usuario usuarioModificado = usuarioService.modificarUsuario(id, modificacionDTO, idUsuarioOperador);
        return ResponseEntity.ok(usuarioModificado);
    }

    @GetMapping
    public ResponseEntity<java.util.List<Usuario>> listarUsuarios(
            @RequestHeader("X-Usuario-Operador-Id") Long idUsuarioOperador) {
        java.util.List<Usuario> usuarios = usuarioService.listarUsuarios(idUsuarioOperador);
        return ResponseEntity.ok(usuarios);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> obtenerUsuarioPorId(
            @PathVariable Long id,
            @RequestHeader("X-Usuario-Operador-Id") Long idUsuarioOperador) {
        Usuario usuario = usuarioService.obtenerUsuarioPorId(id, idUsuarioOperador);
        return ResponseEntity.ok(usuario);
    }
}