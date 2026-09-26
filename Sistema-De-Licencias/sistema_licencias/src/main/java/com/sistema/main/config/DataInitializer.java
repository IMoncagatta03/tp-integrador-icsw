package com.sistema.main.config;

import com.sistema.main.entity.enums.RolUsuario;
import com.sistema.main.entity.Usuario;
import com.sistema.main.repository.UsuarioRepository;
import com.sistema.main.repository.ConfiguracionSistemaRepository;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Inicializa datos por defecto al arrancar la aplicación.
 * Crea el usuario admin si no existe.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;

    public DataInitializer(UsuarioRepository usuarioRepository,
            ConfiguracionSistemaRepository configuracionRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public void run(String... args) {
        String hash = BCrypt.hashpw("admin", BCrypt.gensalt());

        usuarioRepository.findByUsername("admin").ifPresentOrElse(
                admin -> {
                    admin.setPasswordHash(hash);
                    usuarioRepository.save(admin);
                },
                () -> {
                    Usuario admin = new Usuario();
                    admin.setUsername("admin");
                    admin.setPasswordHash(hash);
                    admin.setNombre("Rodrigo");
                    admin.setApellido("Ledesma");
                    admin.setRol(RolUsuario.ADMINISTRADOR);
                    admin.setActivo(true);
                    usuarioRepository.save(admin);
                });
    }
}
