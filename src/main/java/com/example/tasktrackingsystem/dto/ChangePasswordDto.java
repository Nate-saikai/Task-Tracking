package com.example.tasktrackingsystem.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * The type Change password dto.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChangePasswordDto {

    @NotNull(message = "Current password must not be null.")
    @Size(min = 8, message = "Current password must be a minimum of 8 characters.")
    private String currentPassword;

    @NotNull(message = "New password must not be null.")
    @Size(min = 8, message = "New password must be a minimum of 8 characters.")
    private String newPassword;
}
