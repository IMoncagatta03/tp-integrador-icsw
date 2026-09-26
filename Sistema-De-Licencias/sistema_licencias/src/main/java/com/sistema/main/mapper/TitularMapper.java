package com.sistema.main.mapper;

import com.sistema.main.dto.TitularRequestDTO;
import com.sistema.main.dto.TitularResponseDTO;
import com.sistema.main.entity.Titular;
import org.springframework.stereotype.Component;

/**
 * Mapper manual para convertir entre la entidad Titular y sus DTOs.
 * Usa setters directos en lugar de Lombok @Builder para máxima compatibilidad.
 */
@Component
public class TitularMapper {

    /**
     * Convierte un TitularRequestDTO a la entidad Titular.
     */
    public Titular toEntity(TitularRequestDTO dto) {
        Titular t = new Titular();
        t.setTipoDocumento(dto.getTipoDocumento().trim().toUpperCase());
        t.setNumeroDocumento(dto.getNumeroDocumento().trim().toUpperCase());
        t.setApellido(dto.getApellido().trim());
        t.setNombre(dto.getNombre().trim());
        t.setFechaNacimiento(dto.getFechaNacimiento());
        t.setDireccion(dto.getDireccion().trim());
        t.setGrupoSanguineo(dto.getGrupoSanguineo().trim().toUpperCase());
        t.setFactorRh(dto.getFactorRh().trim());
        t.setDonanteOrganos(Boolean.TRUE.equals(dto.getDonanteOrganos()));
        return t;
    }

    /**
     * Convierte la entidad Titular a un TitularResponseDTO.
     */
    public TitularResponseDTO toResponseDTO(Titular titular) {
        TitularResponseDTO dto = new TitularResponseDTO();
        dto.setId(titular.getId());
        dto.setTipoDocumento(titular.getTipoDocumento());
        dto.setNumeroDocumento(titular.getNumeroDocumento());
        dto.setApellido(titular.getApellido());
        dto.setNombre(titular.getNombre());
        dto.setFechaNacimiento(titular.getFechaNacimiento());
        dto.setDireccion(titular.getDireccion());
        dto.setGrupoSanguineo(titular.getGrupoSanguineo());
        dto.setFactorRh(titular.getFactorRh());
        dto.setDonanteOrganos(titular.isDonanteOrganos());
        dto.setCreatedAt(titular.getCreatedAt());
        return dto;
    }
}
