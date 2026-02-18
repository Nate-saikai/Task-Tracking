package com.example.tasktrackingsystem.controllers;

import com.example.tasktrackingsystem.dto.CreateTaskDto;
import com.example.tasktrackingsystem.dto.PersonDto;
import com.example.tasktrackingsystem.dto.TaskDto;
import com.example.tasktrackingsystem.model.Status;
import com.example.tasktrackingsystem.model.Task;
import com.example.tasktrackingsystem.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for managing tasks.
 * Provides endpoints for CRUD operations and filtering by user or status.
 */
@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    /**
     * Retrieves all tasks in the system.
     * Used by the Admin Panel to view all transactions.
     */
    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<TaskDto>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    /**
     * Retrieves a specific task by its ID.
     */
    @GetMapping("/{taskId}")
    public ResponseEntity<TaskDto> getTaskById(@PathVariable Long taskId) {
        return ResponseEntity.ok(taskService.getTaskById(taskId));
    }

    /**
     * Retrieves only the tasks belonging to the currently authenticated user.
     */
    @GetMapping("/my-tasks")
    public ResponseEntity<List<TaskDto>> getMyTasks(@AuthenticationPrincipal PersonDto personDto) {
        Long userId = Long.valueOf(personDto.getPersonId());
        return ResponseEntity.ok(taskService.getTasksByUserId(userId));
    }

    @GetMapping("/my-tasks/filter")
    public ResponseEntity<List<TaskDto>> getMyTasksByStatus(
            @AuthenticationPrincipal PersonDto personDto,
            @RequestParam Status status
    ) {
        Long userId = Long.valueOf(personDto.getPersonId());
        return ResponseEntity.ok(taskService.getTasksByUserIdAndStatus(userId, status));
    }

    /**
     * Filters all tasks by the provided Status enum.
     * Used by the Admin Panel to view all transactions by Status.
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<TaskDto>> getTasksByStatus(@PathVariable Status status) {
        return ResponseEntity.ok(taskService.getTasksByStatus(status));
    }

    /**
     * Creates a new task.
     */
    @PostMapping
    public ResponseEntity<TaskDto> createNewTask(
            @Valid @RequestBody CreateTaskDto taskDto,
            @AuthenticationPrincipal PersonDto personDto
    ) {
        Long userId = Long.valueOf(personDto.getPersonId());
        return new ResponseEntity<>(taskService.createTask(taskDto, userId), HttpStatus.CREATED);
    }

    /**
     * Updates an existing task.
     */
    @PutMapping("/{taskId}")
    public ResponseEntity<TaskDto> updateTask(
            @PathVariable Long taskId,
            @Valid @RequestBody CreateTaskDto taskDetails
    ) {
        return ResponseEntity.ok(taskService.updateTask(taskId, taskDetails));
    }

    /**
     * Deletes a task by ID.
     */
    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTaskById(@PathVariable Long taskId) {
        taskService.deleteTask(taskId);
        return ResponseEntity.noContent().build();
    }
}