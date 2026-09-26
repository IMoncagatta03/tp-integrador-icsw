package com.sistema.main.exception;

// Excepción lanzada cuando se infringe una regla del negocio.
public class ReglaNegocioException extends RuntimeException {
    public ReglaNegocioException(String message) {
        super(message);
    }
}
