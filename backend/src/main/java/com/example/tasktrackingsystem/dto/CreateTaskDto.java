package com.example.tasktrackingsystem.dto;

import com.example.tasktrackingsystem.model.Status;
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

    @NotBlank(message = "Title is required")
    @Size(max = 100, message = "Title must be under 100 characters")
    private String title;

    private String description;

    private Status trackingStatus;
}