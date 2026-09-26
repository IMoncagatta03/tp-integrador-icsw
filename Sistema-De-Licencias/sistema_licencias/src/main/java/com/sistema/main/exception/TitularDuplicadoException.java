package com.sistema.main.exception;

/**
 * Excepción lanzada cuando se intenta registrar un titular con un documento (tipo y número) ya existente.
 * Extiende de ReglaNegocioException para retornar un estado HTTP 422 Unprocessable Content.
 */
public class TitularDuplicadoException extends ReglaNegocioException {
    
    public TitularDuplicadoException(String tipoDocumento, String numeroDocumento) {
        super(String.format("Ya existe un titular registrado con el documento: %s %s", tipoDocumento, numeroDocumento));
    }
}
