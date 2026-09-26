package com.sistema.main.service;

import com.sistema.main.dto.UsuarioNuevoDTO;
import com.sistema.main.entity.Usuario;
import com.sistema.main.entity.enums.RolUsuario;
import com.sistema.main.repository.UsuarioRepository;
import com.sistema.main.service.impl.UsuarioServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceImplTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private UsuarioServiceImpl usuarioService;

    private Usuario operadorAdmin;
    private Usuario operadorAdministrativo;
    private UsuarioNuevoDTO dtoNuevoUsuario;

    @BeforeEach
    void setUp() {
        // Simulamos un operador con rol ADMINISTRADOR (El superusuario, ahora "Usuario del sistema")
        operadorAdmin = new Usuario();
        operadorAdmin.setId(1L);
        operadorAdmin.setUsername("super.admin");
        operadorAdmin.setRol(RolUsuario.ADMINISTRADOR);

        // Simulamos un operador con rol ADMINISTRATIVO (Operador común, ahora el que tiene permisos de ABM)
        operadorAdministrativo = new Usuario();
        operadorAdministrativo.setId(2L);
        operadorAdministrativo.setUsername("operador.comun");
        operadorAdministrativo.setRol(RolUsuario.ADMINISTRATIVO);

        // Datos para el nuevo usuario a crear
        dtoNuevoUsuario = new UsuarioNuevoDTO();
        dtoNuevoUsuario.setUsername("ana.lopez");
        dtoNuevoUsuario.setPassword("securePass123");
        dtoNuevoUsuario.setNombre("Ana");
        dtoNuevoUsuario.setApellido("Lopez");
        dtoNuevoUsuario.setRol(RolUsuario.ADMINISTRATIVO);
        dtoNuevoUsuario.setActivo(true);
    }

    @Test
    void darDeAltaUsuario_debeGuardarExitosamente_cuandoElOperadorEsAdministrativo() {
        // 1. ARRANGEMENT
        Long idAdministrativo = 2L;
        when(usuarioRepository.findById(idAdministrativo)).thenReturn(Optional.of(operadorAdministrativo));
        
        // Simulamos que el save devuelve la entidad con su ID generado por PostgreSQL
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(invocation -> {
            Usuario usuarioAGuardar = invocation.getArgument(0);
            usuarioAGuardar.setId(100L); // ID simulado
            return usuarioAGuardar;
        });

        // 2. ACT
        Usuario resultado = usuarioService.darDeAltaUsuario(dtoNuevoUsuario, idAdministrativo);

        // 3. ASSERT
        assertNotNull(resultado, "El usuario guardado no debería ser nulo");
        assertEquals(100L, resultado.getId(), "El ID debería haber sido asignado simulando la BD");
        assertEquals("ana.lopez", resultado.getUsername());
        assertEquals(RolUsuario.ADMINISTRATIVO, resultado.getRol());
        assertTrue(resultado.getActivo(), "El usuario debería nacer con estado activo por defecto");

        // Verificamos que se interactuó con la BD como corresponde
        verify(usuarioRepository, times(1)).findById(idAdministrativo);
        verify(usuarioRepository, times(1)).save(any(Usuario.class));
    }

    @Test
    void darDeAltaUsuario_debeLanzarException_cuandoElOperadorEsAdministrador() {
        // 1. ARRANGEMENT
        Long idAdmin = 1L;
        when(usuarioRepository.findById(idAdmin)).thenReturn(Optional.of(operadorAdmin));

        // 2. ACT & ASSERT
        Exception exception = assertThrows(RuntimeException.class, () -> {
            usuarioService.darDeAltaUsuario(dtoNuevoUsuario, idAdmin);
        });

        assertTrue(exception.getMessage().contains("No posee privilegios de administrativo"), 
                "El mensaje de error debería indicar la falta de permisos");

        // Verificamos que JAMÁS se llamó al método save del repositorio
        verify(usuarioRepository, times(1)).findById(idAdmin);
        verify(usuarioRepository, never()).save(any(Usuario.class));
    }

    @Test
    void darDeAltaUsuario_debeLanzarException_cuandoElOperadorNoExiste() {
        // 1. ARRANGEMENT
        Long idInexistente = 999L;
        when(usuarioRepository.findById(idInexistente)).thenReturn(Optional.empty());

        // 2. ACT & ASSERT
        assertThrows(RuntimeException.class, () -> {
            usuarioService.darDeAltaUsuario(dtoNuevoUsuario, idInexistente);
        });

        verify(usuarioRepository, never()).save(any(Usuario.class));
    }

    @Test
    void modificarUsuario_debeActualizarDatos_cuandoElOperadorEsAdministrativo() {
        // ARRANGEMENT
        Long idAModificar = 50L;
        Long idAdministrativo = 2L;

        Usuario usuarioViejo = new Usuario();
        usuarioViejo.setId(idAModificar);
        usuarioViejo.setNombre("Carlos");
        usuarioViejo.setApellido("Gomez");
        usuarioViejo.setRol(RolUsuario.ADMINISTRATIVO);
        usuarioViejo.setActivo(true);

        // Usamos UsuarioNuevoDTO pasando la password en null ya que no la vamos a cambiar
        UsuarioNuevoDTO cambioDTO = new UsuarioNuevoDTO();
        cambioDTO.setNombre("Carlos Alberto");
        cambioDTO.setApellido("Gomez Silva");
        cambioDTO.setRol(RolUsuario.ADMINISTRADOR);
        cambioDTO.setPassword(null);
        cambioDTO.setActivo(false); // Probamos también cambiar activo a false

        when(usuarioRepository.findById(idAdministrativo)).thenReturn(Optional.of(operadorAdministrativo));
        when(usuarioRepository.findById(idAModificar)).thenReturn(Optional.of(usuarioViejo));
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // ACT
        Usuario resultado = usuarioService.modificarUsuario(idAModificar, cambioDTO, idAdministrativo);

        // ASSERT
        assertNotNull(resultado);
        assertEquals("Carlos Alberto", resultado.getNombre());
        assertEquals("Gomez Silva", resultado.getApellido());
        assertEquals(RolUsuario.ADMINISTRADOR, resultado.getRol());
        assertFalse(resultado.getActivo());
        
        verify(usuarioRepository, times(1)).save(usuarioViejo);
    }

    @Test
    void modificarUsuario_debeLanzarException_cuandoElOperadorEsAdministrador() {
        // ARRANGEMENT
        Long idAModificar = 50L;
        Long idAdmin = 1L;
        
        UsuarioNuevoDTO cambioDTO = new UsuarioNuevoDTO();
        cambioDTO.setNombre("Juan");
        cambioDTO.setApellido("Perez");
        cambioDTO.setRol(RolUsuario.ADMINISTRATIVO);

        when(usuarioRepository.findById(idAdmin)).thenReturn(Optional.of(operadorAdmin));

        // ACT & ASSERT
        assertThrows(RuntimeException.class, () -> {
            usuarioService.modificarUsuario(idAModificar, cambioDTO, idAdmin);
        });

        verify(usuarioRepository, never()).save(any(Usuario.class));
    }

    @Test
    void listarUsuarios_debeRetornarLista_cuandoElOperadorEsAdministrativo() {
        // ARRANGEMENT
        Long idAdministrativo = 2L;
        when(usuarioRepository.findById(idAdministrativo)).thenReturn(Optional.of(operadorAdministrativo));
        when(usuarioRepository.findAll()).thenReturn(Arrays.asList(operadorAdmin, operadorAdministrativo));

        // ACT
        List<Usuario> listado = usuarioService.listarUsuarios(idAdministrativo);

        // ASSERT
        assertNotNull(listado);
        assertEquals(2, listado.size());
        verify(usuarioRepository, times(1)).findAll();
    }

    @Test
    void obtenerUsuarioPorId_debeRetornarUsuario_cuandoElOperadorEsAdministrativo() {
        // ARRANGEMENT
        Long idAdministrativo = 2L;
        Long idABuscar = 1L;
        when(usuarioRepository.findById(idAdministrativo)).thenReturn(Optional.of(operadorAdministrativo));
        when(usuarioRepository.findById(idABuscar)).thenReturn(Optional.of(operadorAdmin));

        // ACT
        Usuario resultado = usuarioService.obtenerUsuarioPorId(idABuscar, idAdministrativo);

        // ASSERT
        assertNotNull(resultado);
        assertEquals("super.admin", resultado.getUsername());
        verify(usuarioRepository, times(1)).findById(idABuscar);
    }
}