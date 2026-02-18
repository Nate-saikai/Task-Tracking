package com.example.tasktrackingsystem.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * The type Create person dto.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreatePersonDto {
    @Size(min = 8, max = 100, message = "Full name must be a minimum of 8 - 100 characters only.")
    @NotNull(message = "Full name must not be null.")
    private String fullName;

    @NotNull(message = "Role must not be null.")
    private String role;

    @Size(min = 8, max = 50, message = "Username must be a minimum of 8 - 50 characters only.")
    @NotNull(message = "Username must not be null.")
    private String username;

    @Size(min = 8, message = "Password must be a minimum of 8 characters.")
    @NotNull(message = "Password must not be null.")
    private String password;
}
