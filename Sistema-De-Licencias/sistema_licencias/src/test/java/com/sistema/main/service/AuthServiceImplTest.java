package com.sistema.main.service;

import com.sistema.main.dto.LoginRequest;
import com.sistema.main.dto.LoginResponse;
import com.sistema.main.entity.Usuario;
import com.sistema.main.entity.enums.RolUsuario;
import com.sistema.main.repository.UsuarioRepository;
import com.sistema.main.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mindrot.jbcrypt.BCrypt;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private AuthServiceImpl authService;

    private Usuario usuarioActivo;
    private Usuario usuarioInactivo;
    private String plainPassword = "password123";
    private String hashedPassword;

    @BeforeEach
    void setUp() {
        hashedPassword = BCrypt.hashpw(plainPassword, BCrypt.gensalt());

        usuarioActivo = new Usuario();
        usuarioActivo.setId(1L);
        usuarioActivo.setUsername("juan.perez");
        usuarioActivo.setPasswordHash(hashedPassword);
        usuarioActivo.setNombre("Juan");
        usuarioActivo.setApellido("Perez");
        usuarioActivo.setRol(RolUsuario.ADMINISTRATIVO);
        usuarioActivo.setActivo(true);

        usuarioInactivo = new Usuario();
        usuarioInactivo.setId(2L);
        usuarioInactivo.setUsername("maria.gomez");
        usuarioInactivo.setPasswordHash(hashedPassword);
        usuarioInactivo.setNombre("Maria");
        usuarioInactivo.setApellido("Gomez");
        usuarioInactivo.setRol(RolUsuario.ADMINISTRADOR);
        usuarioInactivo.setActivo(false);
    }

    @Test
    void login_debeRetornarLoginResponse_cuandoCredencialesSonValidas() {
        // Arrange
        LoginRequest request = new LoginRequest("juan.perez", plainPassword);
        when(usuarioRepository.findByUsername("juan.perez")).thenReturn(Optional.of(usuarioActivo));

        // Act
        LoginResponse response = authService.login(request);

        // Assert
        assertNotNull(response);
        assertEquals(usuarioActivo.getId(), response.getId());
        assertEquals(usuarioActivo.getUsername(), response.getUsername());
        assertEquals(usuarioActivo.getNombre(), response.getNombre());
        assertEquals(usuarioActivo.getApellido(), response.getApellido());
        assertEquals(usuarioActivo.getRol(), response.getRol());

        verify(usuarioRepository, times(1)).findByUsername("juan.perez");
    }

    @Test
    void login_debeLanzarException_cuandoUsuarioNoExiste() {
        // Arrange
        LoginRequest request = new LoginRequest("inexistente", plainPassword);
        when(usuarioRepository.findByUsername("inexistente")).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.login(request);
        });

        assertEquals("Usuario o contraseña incorrectos.", exception.getMessage());
        verify(usuarioRepository, times(1)).findByUsername("inexistente");
    }

    @Test
    void login_debeLanzarException_cuandoUsuarioEstaInactivo() {
        // Arrange
        LoginRequest request = new LoginRequest("maria.gomez", plainPassword);
        when(usuarioRepository.findByUsername("maria.gomez")).thenReturn(Optional.of(usuarioInactivo));

        // Act & Assert
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.login(request);
        });

        assertEquals("el usuario no esta activo", exception.getMessage());
        verify(usuarioRepository, times(1)).findByUsername("maria.gomez");
    }

    @Test
    void login_debeLanzarException_cuandoContrasenaEsIncorrecta() {
        // Arrange
        LoginRequest request = new LoginRequest("juan.perez", "wrongPassword");
        when(usuarioRepository.findByUsername("juan.perez")).thenReturn(Optional.of(usuarioActivo));

        // Act & Assert
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.login(request);
        });

        assertEquals("Usuario o contraseña incorrectos.", exception.getMessage());
        verify(usuarioRepository, times(1)).findByUsername("juan.perez");
    }
}
