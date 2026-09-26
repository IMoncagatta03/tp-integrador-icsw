package com.sistema.main.controller;

import com.sistema.main.dto.TitularModificacionDTO;
import com.sistema.main.dto.TitularRequestDTO;
import com.sistema.main.dto.TitularResponseDTO;
import com.sistema.main.service.TitularService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

/**
 * Controlador REST para la gestión de titulares.
 *
 * Base URL: /api/titulares
 */
@RestController
@RequestMapping("/api/titulares")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class TitularController {

    private final TitularService titularService;

    public TitularController(TitularService titularService) {
        this.titularService = titularService;
    }

    /**
     * POST /api/titulares
     * Da de alta un nuevo titular.
     */
    @PostMapping
    public ResponseEntity<TitularResponseDTO> darDeAltaTitular(
            @Valid @RequestBody TitularRequestDTO dto) {

        TitularResponseDTO response = titularService.darDeAltaTitular(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/titulares/{id}
     * Busca un titular por su ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<TitularResponseDTO> buscarPorId(@PathVariable Long id) {
        TitularResponseDTO response = titularService.buscarPorId(id);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/titulares/documento?tipo=DNI&numero=12345678
     * Busca un titular por tipo y número de documento.
     */
    @GetMapping("/documento")
    public ResponseEntity<TitularResponseDTO> buscarPorDocumento(
            @RequestParam("tipo") String tipo,
            @RequestParam("numero") String numero) {

        Optional<TitularResponseDTO> resultado = titularService.buscarPorDocumento(tipo, numero);
        return resultado
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/titulares/buscar?tipoDocumento=DNI&numeroDocumento=12345678
     * Busca un titular por tipo y número de documento (usado por el frontend).
     */
    @GetMapping("/buscar")
    public ResponseEntity<TitularResponseDTO> buscarPorDocumentoFront(
            @RequestParam("tipoDocumento") String tipoDocumento,
            @RequestParam("numeroDocumento") String numeroDocumento) {

        Optional<TitularResponseDTO> resultado = titularService.buscarPorDocumento(tipoDocumento, numeroDocumento);
        return resultado
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<java.util.List<TitularResponseDTO>> obtenerTodos() {
        return ResponseEntity.ok(titularService.obtenerTodos());
    }

    @PutMapping("/{id}")
    public ResponseEntity<TitularResponseDTO> modificarTitular(
            @PathVariable Long id,
            @RequestBody TitularModificacionDTO dto) {
        
        TitularResponseDTO actualizado = titularService.modificarTitular(id, dto);
        return ResponseEntity.ok(actualizado);
    }

}
