package com.sistema.main;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import com.sistema.main.repository.UsuarioRepository;
import com.sistema.main.entity.Usuario;
import org.mindrot.jbcrypt.BCrypt;
import java.util.List;

@SpringBootTest
class SistemaLicenciasApplicationTests {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Test
    void contextLoads() {
    }
}
