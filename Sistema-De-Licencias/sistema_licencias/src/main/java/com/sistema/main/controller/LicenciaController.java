package com.sistema.main.controller;

import com.sistema.main.entity.enums.ClaseLicencia;
import com.sistema.main.dto.LicenciaDTO;
import com.sistema.main.dto.RenovacionLicenciaRequestDTO;
import com.sistema.main.dto.CopiaLicenciaRequestDTO;
import com.sistema.main.entity.Licencia;
import com.sistema.main.entity.Titular;
import com.sistema.main.entity.Tramite;
import com.sistema.main.repository.TitularRepository;
import com.sistema.main.repository.LicenciaRepository;
import com.sistema.main.repository.TramiteRepository;
import com.sistema.main.service.impl.LicenciaServiceImpl;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/licencias")
@RequiredArgsConstructor
public class LicenciaController {

    private final LicenciaServiceImpl licenciaService;

    private final TitularRepository titularRepository;

    private final LicenciaRepository licenciaRepository;

    private final TramiteRepository tramiteRepository;

    private final com.sistema.main.util.FechaSimulada fechaSimulada;

    @GetMapping("/vigencia")
    public ResponseEntity<?> obtenerVigencia(@RequestParam Long titularId, @RequestParam ClaseLicencia clase) {
        try {
            Titular titular = titularRepository.findById(titularId)
                    .orElseThrow(() -> new RuntimeException("Error: Titular no encontrado en el sistema."));

            int vigenciaAnos = licenciaService.calcularVigenciaAnos(titular, clase);
            LocalDate fechaInicio = fechaSimulada.getLocalDate();
            LocalDate fechaVencimiento = titular.getFechaNacimiento().withYear(fechaInicio.getYear() + vigenciaAnos);

            return ResponseEntity.ok(new VigenciaResponse(vigenciaAnos, fechaVencimiento));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/emitir")
    public ResponseEntity<?> emitirNuevaLicencia(
            @RequestParam Long titularId,
            @RequestParam ClaseLicencia clase,
            @RequestParam(required = false) String observaciones,
            @RequestParam Long usuarioId) {
        try {
            // 1. Buscamos el objeto Titular real en Postgres usando el repositorio
            Titular titular = titularRepository.findById(titularId)
                    .orElseThrow(() -> new RuntimeException("Error: Titular no encontrado en el sistema."));

            // 2. Invocamos a tu servicio unificado con los parámetros correctos
            Licencia licenciaEmitida = licenciaService.emitirLicencia(titular, clase, observaciones, usuarioId);

            return ResponseEntity.ok(licenciaEmitida);
        } catch (Exception e) {
            // Si salta un error de edad mínima o antecedentes, devolvemos el mensaje al
            // front
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/titular/{titularId}")
    public ResponseEntity<?> obtenerLicenciasDeTitular(@PathVariable Long titularId) {
        try {
            Titular titular = titularRepository.findById(titularId)
                    .orElseThrow(() -> new RuntimeException("Error: Titular no encontrado."));
            List<Licencia> licencias = licenciaRepository.findByTitular(titular);

            List<Map<String, Object>> res = licencias.stream().map(lic -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", lic.getId());
                map.put("clase", lic.getClase());
                map.put("fechaInicio", lic.getFechaInicio());
                map.put("fechaVencimiento", lic.getFechaVencimiento());
                map.put("observaciones", lic.getObservaciones());
                map.put("estado", lic.getEstado());
                return map;
            }).toList();

            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{licenciaId}/tramites")
    public ResponseEntity<?> obtenerTramitesDeLicencia(@PathVariable Long licenciaId) {
        try {
            Licencia licencia = licenciaRepository.findById(licenciaId)
                    .orElseThrow(() -> new RuntimeException("Error: Licencia no encontrada."));
            List<Tramite> tramites = tramiteRepository.findByLicencia(licencia);

            List<Map<String, Object>> res = tramites.stream().map(tr -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", tr.getId());
                map.put("tipoTramite", tr.getTipoTramite());
                map.put("fechaTramite", tr.getFechaTramite());
                map.put("costoBase", tr.getCostoBase());
                map.put("gastosAdministrativos", tr.getGastosAdministrativos());
                map.put("costoTotal", tr.getCostoTotal());
                map.put("operador", tr.getUsuario() != null ? tr.getUsuario().getUsername() : "Sistema");
                return map;
            }).toList();

            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    public static class VigenciaResponse {
        private final int vigenciaAnos;
        private final LocalDate fechaVencimiento;

        public VigenciaResponse(int vigenciaAnos, LocalDate fechaVencimiento) {
            this.vigenciaAnos = vigenciaAnos;
            this.fechaVencimiento = fechaVencimiento;
        }

        public int getVigenciaAnos() {
            return vigenciaAnos;
        }

        public LocalDate getFechaVencimiento() {
            return fechaVencimiento;
        }
    }

    @GetMapping("/expiradas")
    public ResponseEntity<List<LicenciaDTO>> listarLicenciasExpiradas() {
        List<LicenciaDTO> expiradas = licenciaService.obtenerLicenciasExpiradas();

        return ResponseEntity.ok(expiradas);
    }

    @GetMapping("/vigentes")
    public ResponseEntity<List<LicenciaDTO>> listarLicenciasVigentes(
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) String grupoSanguineo,
            @RequestParam(required = false) String factorRh,
            @RequestParam(required = false) Boolean donante) {

        List<LicenciaDTO> resultado = licenciaService.buscarLicenciasVigentes(nombre, grupoSanguineo, factorRh,
                donante);
        return ResponseEntity.ok(resultado);
    }

    @PostMapping("/renovar")
    public ResponseEntity<LicenciaDTO> renovarLicencia(
            @RequestBody RenovacionLicenciaRequestDTO requestDTO,
            @RequestHeader("X-Usuario-Operador-Id") Long idUsuarioOperador) {

        LicenciaDTO nuevaLicencia = licenciaService.renovarLicencia(requestDTO, idUsuarioOperador);
        return ResponseEntity.ok(nuevaLicencia);
    }

    @PostMapping("/copia")
    public ResponseEntity<LicenciaDTO> emitirCopiaLicencia(
            @RequestBody CopiaLicenciaRequestDTO requestDTO,
            @RequestHeader("X-Usuario-Operador-Id") Long idUsuarioOperador) {

        LicenciaDTO copiaLicencia = licenciaService.emitirCopiaLicencia(requestDTO, idUsuarioOperador);
        return ResponseEntity.ok(copiaLicencia);
    }

}
