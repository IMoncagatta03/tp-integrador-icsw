package com.sistema.main.mapper;

import com.sistema.main.dto.LicenciaDTO;
import com.sistema.main.entity.Licencia;
import org.springframework.stereotype.Component;

@Component // <--- Esto es clave para que Spring lo pueda inyectar en el Service
public class LicenciaMapper {

    public LicenciaDTO toDTO(Licencia licencia) {
        if (licencia == null) {
            return null;
        }

        LicenciaDTO dto = new LicenciaDTO();
        dto.setId(licencia.getId());
        dto.setClase(licencia.getClase());
        dto.setFechaInicio(licencia.getFechaInicio());
        dto.setFechaVencimiento(licencia.getFechaVencimiento());
        dto.setEstado(licencia.getEstado());
        dto.setObservaciones(licencia.getObservaciones());

        // Mapeamos los datos del Titular si es que la licencia tiene uno asociado
        if (licencia.getTitular() != null) {
            dto.setNombreTitular(licencia.getTitular().getNombre());
            dto.setApellidoTitular(licencia.getTitular().getApellido());
            dto.setTipoDocumentoTitular(licencia.getTitular().getTipoDocumento());
            dto.setNumeroDocumentoTitular(licencia.getTitular().getNumeroDocumento());
            dto.setGrupoSanguineoTitular(licencia.getTitular().getGrupoSanguineo());
            dto.setFactorRhTitular(licencia.getTitular().getFactorRh());
            dto.setDonanteOrganosTitular(licencia.getTitular().isDonanteOrganos());
        }

        return dto;
    }
}
