package com.example.tasktrackingsystem.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * The type Person dto.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PersonDto {
    @NotNull(message = "ID must not be null.")
    private Long personId;

    @Size(min = 8, max = 100, message = "Full name must be a minimum of 8 - 100 characters only.")
    @NotNull(message = "Full name must not be null.")
    private String fullName;

    @Size(min = 5, max = 8, message = "Role must be 5 - 8 characters long.")
    @NotNull(message = "Role must not be null.")
    private String role;

    @Size(min = 8, max = 50, message = "Username must be a minimum of 8 - 50 characters only.")
    @NotNull(message = "Username must not be null.")
    private String username;
}
