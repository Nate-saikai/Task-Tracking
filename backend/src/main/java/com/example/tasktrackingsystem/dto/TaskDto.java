package com.example.tasktrackingsystem.dto;

import com.example.tasktrackingsystem.model.Status;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO for returning Task data.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Data Transfer Object representing a task's full details")
public class TaskDto {
    @Schema(description = "The unique database ID of the task", example = "1")
    private Long id;

    @Schema(description = "The title of the task", example = "Complete Capstone Project")
    private String title;

    @Schema(description = "A detailed description of the task", example = "Finish the backend implementation and tests")
    private String description;

    @Schema(description = "The current lifecycle status of the task", example = "TO_DO")
    private Status trackingStatus;

    @Schema(description = "The ID of the user who owns this task", example = "101")
    private Long userId;
}