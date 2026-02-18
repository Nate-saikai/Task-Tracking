package com.example.tasktrackingsystem.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * The type Patch person profile dto.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PatchPersonProfileDto {
    @Size(min = 8, max = 100, message = "Full name must be a minimum of 8 - 100 characters only.")
    private String fullName;

    @Size(min = 8, max = 50, message = "Username must be a minimum of 8 - 50 characters only.")
    private String username;
}
