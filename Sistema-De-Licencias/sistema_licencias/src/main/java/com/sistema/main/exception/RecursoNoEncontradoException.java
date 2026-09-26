package com.sistema.main.exception;

// Excepción lanzada cuando no se encuentra un recurso solicitado.
public class RecursoNoEncontradoException extends RuntimeException {
    public RecursoNoEncontradoException(String message) {
        super(message);
    }
}
