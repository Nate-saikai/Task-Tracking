package com.example.tasktrackingsystem.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * The type Login person dto.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoginPersonDto {
    @NotNull(message = "Username must not be null.")
    private String username;

    @NotNull(message = "Password must not be null.")
    private String password;
}
