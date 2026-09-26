package com.sistema.main.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.sistema.main.entity.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByUsername(String username);

            
}
