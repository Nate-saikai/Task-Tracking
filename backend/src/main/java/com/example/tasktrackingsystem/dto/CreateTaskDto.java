package com.example.tasktrackingsystem.dto;

import com.example.tasktrackingsystem.model.Status;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO for creating a new Task.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateTaskDto {

    @Schema(description = "Brief title of the task", example = "Finish Capstone Backend", maxLength = 100)
    @NotBlank(message = "Title is required")
    @Size(max = 100, message = "Title must be under 100 characters")
    private String title;

    @Schema(description = "Detailed description of the task", example = "Implement Swagger and ownership checks")
    private String description;

    @Schema(description = "Current status of the task", example = "TO_DO")
    private Status trackingStatus;
}