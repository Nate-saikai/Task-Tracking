package com.example.tasktrackingsystem.controllerhandlier;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

import com.example.tasktrackingsystem.exceptions.InvalidInputException;
import com.example.tasktrackingsystem.exceptions.StatusNotFoundException;
import com.example.tasktrackingsystem.exceptions.TaskNotFoundException;
import com.example.tasktrackingsystem.exceptions.PersonNotFoundException;
import org.springframework.dao.DuplicateKeyException;
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
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DuplicateKeyException.class)
    public ResponseEntity<ApiError> handleDuplicateKey(DuplicateKeyException ex, HttpServletRequest req) {
        return build(HttpStatus.CONFLICT, "DUPLICATE ENTRY", ex.getMessage(), req, null);
    }

    @ExceptionHandler(InvalidInputException.class)
    public ResponseEntity<ApiError> handleInvalidInput(InvalidInputException ex, HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, "INVALID", ex.getMessage(), req, null);
    }

    @ExceptionHandler(StatusNotFoundException.class)
    public ResponseEntity<ApiError> handleStatusNotFound(StatusNotFoundException ex, HttpServletRequest req) {
        return build(HttpStatus.NOT_FOUND, "STATUS_NOT_FOUND", ex.getMessage(), req, null);
    }

    @ExceptionHandler(TaskNotFoundException.class)
    public ResponseEntity<ApiError> handleTaskNotFound(TaskNotFoundException ex, HttpServletRequest req) {
        return build(HttpStatus.NOT_FOUND, "TASK_NOT_FOUND", ex.getMessage(), req, null);
    }

    @ExceptionHandler(PersonNotFoundException.class)
    public ResponseEntity<ApiError> handlePersonNotFound(PersonNotFoundException ex, HttpServletRequest req) {
        return build(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", ex.getMessage(), req, null);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> handleArgsMismatch(MethodArgumentTypeMismatchException ex, HttpServletRequest req) {
        String message = "";
        if (ex.getMessage().contains("Status") || ex.getMessage().contains("Role")) {
            if (ex.getValue() != null) {
                message = ex.getValue().toString() + " not part of available options";
            } else {
                message = "Null values not allowed";
            }
            return build(HttpStatus.NOT_FOUND, "ENUM ARG MISMATCH", message, req, null);
        }

        // --------------------------------------------------------------------------------
        // ------------------------- HANDLING FOR MISMATCH TYPES --------------------------
        // --------------------------------------------------------------------------------

        String paramName = ex.getName();
        Class<?> required = ex.getRequiredType();
        Object value = ex.getValue();
        Class<?> argument = (value != null) ? value.getClass() : null;

        message = String.format("Parameter '%s' should be of type %s, but value '%s' is of type %s",
                    paramName,
                    required != null ? required.getSimpleName() : "?",
                    value != null ? value.toString() : "?",
                    argument != null ? argument.getSimpleName() : "?"
                );

        return build(HttpStatus.BAD_REQUEST, String.format("MISMATCH: %s is not %s",
                required != null ? required.getSimpleName() : "?",
                argument != null ? argument.getSimpleName() : "?"
                ), message, req, null);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(EntityNotFoundException ex, HttpServletRequest req) {
        return build(HttpStatus.NOT_FOUND, "NOT_FOUND", ex.getMessage(), req, null);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiError> handleBadCredentials(BadCredentialsException ex, HttpServletRequest req) {
        return build(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Invalid username or password.", req, null);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleAccessDenied(AccessDeniedException ex, HttpServletRequest req) {
        return build(HttpStatus.FORBIDDEN, "FORBIDDEN", "You do not have permission to perform this action.", req, null);
    }

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

    @ExceptionHandler({ IllegalArgumentException.class, IllegalStateException.class, ConstraintViolationException.class })
    public ResponseEntity<ApiError> handleBusiness(Exception ex, HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, "BUSINESS_RULE_VIOLATION", ex.getMessage(), req, null);
    }

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

    public record ApiError(
            String timestamp,
            int status,
            String error,
            String message,
            String path,
            Map<String, String> fieldErrors
    ) {}
}
