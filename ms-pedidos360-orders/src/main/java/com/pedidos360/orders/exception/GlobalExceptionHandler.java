package com.pedidos360.orders.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(OrderNotFoundException.class)
    public ProblemDetail handleOrderNotFound(OrderNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Pedido No Encontrado");
        problem.setType(URI.create("https://api.pedidos360.com/errors/order-not-found"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    @ExceptionHandler(InvalidOrderStateException.class)
    public ProblemDetail handleInvalidOrderState(InvalidOrderStateException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage());
        problem.setTitle("Transición de Estado Inválida");
        problem.setType(URI.create("https://api.pedidos360.com/errors/invalid-order-state"));
        problem.setProperty("currentStatus", ex.getCurrentStatus());
        problem.setProperty("attemptedStatus", ex.getAttemptedStatus());
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    @ExceptionHandler(CatalogStockException.class)
    public ProblemDetail handleCatalogStockException(CatalogStockException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
        problem.setTitle("Fallo de Descuento de Stock en Catálogo");
        problem.setType(URI.create("https://api.pedidos360.com/errors/stock-discount-failed"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidationExceptions(MethodArgumentNotValidException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Error de validación en campos de la petición");
        problem.setTitle("Validación Fallida");
        problem.setType(URI.create("https://api.pedidos360.com/errors/validation-error"));

        Map<String, String> errors = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            errors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }
        problem.setProperty("invalidFields", errors);
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ProblemDetail handleAccessDenied(AccessDeniedException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "No posee los roles o permisos requeridos de Azure AD");
        problem.setTitle("Acceso Denegado");
        problem.setType(URI.create("https://api.pedidos360.com/errors/forbidden"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleGeneralException(Exception ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Ha ocurrido un error inesperado en el servidor");
        problem.setTitle("Error Interno");
        problem.setType(URI.create("https://api.pedidos360.com/errors/internal-error"));
        problem.setProperty("cause", ex.getMessage());
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }
}
