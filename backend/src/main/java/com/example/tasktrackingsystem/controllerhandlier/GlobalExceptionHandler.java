package com.example.tasktrackingsystem.controllerhandlier;

import java.time.Instant;
import java.util.Arrays;
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

/**
 * Global Exception Handler
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handle duplicate key response entity.
     *
     * @param ex  {@link DuplicateKeyException}
     * @param req {@link HttpServletRequest}
     * @return {@code CONFLICT} Response build "DUPLICATE ENTRY"
     */
    @ExceptionHandler(DuplicateKeyException.class)
    public ResponseEntity<ApiError> handleDuplicateKey(DuplicateKeyException ex, HttpServletRequest req) {
        return build(HttpStatus.CONFLICT, "DUPLICATE ENTRY", ex.getMessage(), req, null);
    }

    /**
     * Handle invalid input response entity.
     *
     * @param ex  {@link InvalidInputException}
     * @param req {@link HttpServletRequest}
     * @return {@code BAD_REQUEST} Response build "INVALID"
     */
    @ExceptionHandler(InvalidInputException.class)
    public ResponseEntity<ApiError> handleInvalidInput(InvalidInputException ex, HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, "INVALID", ex.getMessage(), req, null);
    }

    /**
     * Handle status not found response entity.
     *
     * @param ex  {@link StatusNotFoundException}
     * @param req {@link HttpServletRequest}
     * @return {@code NOT_FOUND} Response build "STATUS_NOT_FOUND"
     */
    @ExceptionHandler(StatusNotFoundException.class)
    public ResponseEntity<ApiError> handleStatusNotFound(StatusNotFoundException ex, HttpServletRequest req) {
        return build(HttpStatus.NOT_FOUND, "STATUS_NOT_FOUND", ex.getMessage(), req, null);
    }

    /**
     * Handle task not found response entity.
     *
     * @param ex  {@link TaskNotFoundException}
     * @param req {@link HttpServletRequest}
     * @return {@code NOT_FOUND} Response build "TASK_NOT_FOUND"
     */
    @ExceptionHandler(TaskNotFoundException.class)
    public ResponseEntity<ApiError> handleTaskNotFound(TaskNotFoundException ex, HttpServletRequest req) {
        return build(HttpStatus.NOT_FOUND, "TASK_NOT_FOUND", ex.getMessage(), req, null);
    }

    /**
     * Handle person not found response entity.
     *
     * @param ex  {@link PersonNotFoundException}
     * @param req {@link HttpServletRequest}
     * @return {@code NOT_FOUND} Response build "USER_NOT_FOUND"
     */
    @ExceptionHandler(PersonNotFoundException.class)
    public ResponseEntity<ApiError> handlePersonNotFound(PersonNotFoundException ex, HttpServletRequest req) {
        return build(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", ex.getMessage(), req, null);
    }

    /**
     * Handle argument mismatch response entity.
     *
     * @param ex  {@link MethodArgumentTypeMismatchException}
     * @param req {@link HttpServletRequest}
     * @return {@code NOT_FOUND} || {@code BAD_REQUEST}
     * Response build "ENUM_ARG_MISMATCH" || "MISMATCH: {@code actualClass} IS NOT {@code requiredClass}
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> handleArgsMismatch(MethodArgumentTypeMismatchException ex, HttpServletRequest req) {
        String message = "";
        if (ex.getRequiredType() != null && ex.getRequiredType().isEnum()) {
            String[] options = Arrays
                    .stream(ex.getRequiredType().getEnumConstants())
                    .map(e -> ((Enum<?>) e).name())
                    .toArray(String[]::new);

            if (ex.getValue() != null) {
                message = String.format("'%s' not part of available options: %s",
                        ex.getValue().toString(),
                        Arrays.toString(options));
            } else {
                message = "Null values not allowed";
            }
            return build(HttpStatus.NOT_FOUND, "ENUM_ARG_MISMATCH", message, req, null);
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

        return build(HttpStatus.BAD_REQUEST, String.format("MISMATCH: %s IS NOT %s",
                required != null ? required.getSimpleName().toUpperCase() : "?",
                argument != null ? argument.getSimpleName().toUpperCase() : "?"
                ), message, req, null);
    }

    /**
     * Handle not found response entity.
     *
     * @param ex  {@link EntityNotFoundException}
     * @param req {@link HttpServletRequest}
     * @return {@code NOT_FOUND} Response build
     */
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(EntityNotFoundException ex, HttpServletRequest req) {
        return build(HttpStatus.NOT_FOUND, "NOT_FOUND", ex.getMessage(), req, null);
    }

    /**
     * Handle bad credentials response entity.
     *
     * @param ex  {@link BadCredentialsException}
     * @param req {@link HttpServletRequest}
     * @return {@code UNAUTHORIZED} Response build
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiError> handleBadCredentials(BadCredentialsException ex, HttpServletRequest req) {
        return build(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Invalid username or password.", req, null);
    }

    /**
     * Handle access denied response entity.
     *
     * @param ex  {@link AccessDeniedException}
     * @param req {@link HttpServletRequest}
     * @return {@code FORBIDDEN} Response build
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleAccessDenied(AccessDeniedException ex, HttpServletRequest req) {
        return build(HttpStatus.FORBIDDEN, "FORBIDDEN", "You do not have permission to perform this action.", req, null);
    }

    /**
     * Handle validation response entity.
     *
     * @param ex  {@link MethodArgumentNotValidException}
     * @param req {@link HttpServletRequest}
     * @return {@code BAD_REQUEST} Response build "VALIDATION_ERROR"
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
     * @param ex  {@link IllegalArgumentException}
     * @param req {@link HttpServletRequest}
     * @return {@code BAD_REQUEST} Response build "BUSINESS_RULE_VIOLATION"
     */
    @ExceptionHandler({ IllegalArgumentException.class, IllegalStateException.class, ConstraintViolationException.class })
    public ResponseEntity<ApiError> handleBusiness(Exception ex, HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, "BUSINESS_RULE_VIOLATION", ex.getMessage(), req, null);
    }

    /**
     * Handle unexpected response entity.
     *
     * @param ex  {@link TaskNotFoundException}
     * @param req {@link HttpServletRequest}
     * @return {@code INTERNAL_SERVER_ERROR} Response build
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpected(Exception ex, HttpServletRequest req) {
        // TODO: add logger.error("Unhandled exception", ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR", "Unexpected server error.", req, null);
    }

    /**
     *
     * @param status {@link HttpStatus}
     * @param error {@link String}
     * @param message {@link String}
     * @param req {@link HttpServletRequest}
     * @param fieldErrors {@link Map} {@code <String, String>}
     * @return {@link ResponseEntity} {@code status} and {@code body}
     */
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
     * {@link Record} for local {@code build} method
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
