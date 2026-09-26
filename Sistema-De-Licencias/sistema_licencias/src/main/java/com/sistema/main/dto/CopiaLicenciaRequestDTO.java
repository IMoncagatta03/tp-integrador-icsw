package com.sistema.main.dto;

import com.sistema.main.entity.enums.MotivoCopia; // <--- AGREGADO
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CopiaLicenciaRequestDTO {
    private Long idLicenciaOriginal;
    private MotivoCopia motivoCopia; // <--- CAMBIADO DE String A ENUM
}