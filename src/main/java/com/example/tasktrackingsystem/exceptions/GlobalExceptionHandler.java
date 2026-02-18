package com.example.tasktrackingsystem.exceptions;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;

/**
 * The type Global exception handler.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handle not found response entity.
     *
     * @param ex  the ex
     * @param req the req
     * @return the response entity
     */
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(EntityNotFoundException ex, HttpServletRequest req) {
        return build(HttpStatus.NOT_FOUND, "NOT_FOUND", ex.getMessage(), req, null);
    }

    /**
     * Handle bad credentials response entity.
     *
     * @param ex  the ex
     * @param req the req
     * @return the response entity
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiError> handleBadCredentials(BadCredentialsException ex, HttpServletRequest req) {
        return build(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Invalid username or password.", req, null);
    }

    /**
     * Handle access denied response entity.
     *
     * @param ex  the ex
     * @param req the req
     * @return the response entity
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleAccessDenied(AccessDeniedException ex, HttpServletRequest req) {
        return build(HttpStatus.FORBIDDEN, "FORBIDDEN", "You do not have permission to perform this action.", req, null);
    }

    /**
     * Handle validation response entity.
     *
     * @param ex  the ex
     * @param req the req
     * @return the response entity
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        Map<String, String> fieldErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        fe -> fe.getDefaultMessage() == null ? "Invalid value" : fe.getDefaultMessage(),
                        (first, second) -> first,
                        LinkedHashMap::new
                ));

        return build(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Validation failed.", req, fieldErrors);
    }

    /**
     * Handle business response entity.
     *
     * @param ex  the ex
     * @param req the req
     * @return the response entity
     */
    @ExceptionHandler({ IllegalArgumentException.class, IllegalStateException.class, ConstraintViolationException.class })
    public ResponseEntity<ApiError> handleBusiness(Exception ex, HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, "BUSINESS_RULE_VIOLATION", ex.getMessage(), req, null);
    }

    /**
     * Handle unexpected response entity.
     *
     * @param ex  the ex
     * @param req the req
     * @return the response entity
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpected(Exception ex, HttpServletRequest req) {
        // TODO: add logger.error("Unhandled exception", ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR", "Unexpected server error.", req, null);
    }

    private ResponseEntity<ApiError> build(
            HttpStatus status,
            String error,
            String message,
            HttpServletRequest req,
            Map<String, String> fieldErrors
    ) {
        ApiError body = new ApiError(
                Instant.now().toString(),
                status.value(),
                error,
                message,
                req.getRequestURI(),
                fieldErrors
        );

        return ResponseEntity.status(status).body(body);
    }

    /**
     * The type Api error.
     */
    public record ApiError(
            String timestamp,
            int status,
            String error,
            String message,
            String path,
            Map<String, String> fieldErrors
    ) {}
}
