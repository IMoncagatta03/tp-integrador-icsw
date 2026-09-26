package com.sistema.main.exception;

/**
 * Excepción lanzada cuando no se encuentra un titular solicitado por su ID.
 * Extiende de RecursoNoEncontradoException para retornar un estado HTTP 404 Not Found.
 */
public class TitularNotFoundException extends RecursoNoEncontradoException {
    
    public TitularNotFoundException(Long id) {
        super(String.format("No se encontró el titular con el ID: %d", id));
    }
}
