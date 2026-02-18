package com.example.tasktrackingsystem.controllers;

import com.example.tasktrackingsystem.model.Task;
import com.example.tasktrackingsystem.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<List<Task>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    /**
     * Retrieves a specific task by its ID.
     */
    @GetMapping("/{taskId}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long taskId) {
        return ResponseEntity.ok(taskService.getTaskById(taskId));
    }

    /**
     * Creates a new task.
     */
    @PostMapping
    public ResponseEntity<Task> createNewTask(
            @Valid @RequestBody Task task,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // Pass the username from the security context to the service
        return new ResponseEntity<>(taskService.createTask(task, userDetails.getId()), HttpStatus.CREATED);
    }

    /**
     * Updates an existing task.
     */
    @PutMapping("/{taskId}")
    public ResponseEntity<Task> updateTask(@PathVariable Long taskId, @Valid @RequestBody Task taskDetails) {
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