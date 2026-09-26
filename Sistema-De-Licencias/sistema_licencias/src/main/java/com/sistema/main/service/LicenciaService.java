package com.sistema.main.service;

import com.sistema.main.entity.Licencia;
import com.sistema.main.entity.Titular;
import com.sistema.main.entity.enums.ClaseLicencia;
import com.sistema.main.dto.CopiaLicenciaRequestDTO;
import com.sistema.main.dto.LicenciaDTO;
import com.sistema.main.dto.RenovacionLicenciaRequestDTO;

import java.util.List;

public interface LicenciaService {
    public int calcularVigenciaAnos(Titular titular, ClaseLicencia clase);

    public void verificarRequisitosEmision(Titular titular, ClaseLicencia claseSolicitada);

    public Licencia emitirLicencia(Titular titular, ClaseLicencia clase, String observaciones, Long usuarioId);

    public List<LicenciaDTO> obtenerLicenciasExpiradas();

    List<LicenciaDTO> buscarLicenciasVigentes(String nombre, String grupoSanguineo, String factorRh, Boolean donante);

    LicenciaDTO renovarLicencia(RenovacionLicenciaRequestDTO request, Long idUsuarioOperador);

    LicenciaDTO emitirCopiaLicencia(CopiaLicenciaRequestDTO request, Long idUsuarioOperador);
    
}
