package com.example.tasktrackingsystem.controllers;

import com.example.tasktrackingsystem.dto.CreateTaskDto;
import com.example.tasktrackingsystem.dto.PersonDto;
import com.example.tasktrackingsystem.dto.TaskDto;
import com.example.tasktrackingsystem.model.Status;
import com.example.tasktrackingsystem.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for managing tasks.
 * Provides endpoints for CRUD operations and filtering by user or status.
 */
@RestController
@RequestMapping("${api.path.tasks}")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @Value("${page.size}")
    private int pageSize;

    /**
     * Retrieves all tasks in the system.
     * Used by the Admin Panel to view all transactions.
     */
    @GetMapping("/paginated/{pageNumber}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Page<TaskDto>> getAllTasks(@PathVariable int pageNumber) {
        Pageable pageable = PageRequest.of(pageNumber, pageSize);
        return ResponseEntity.ok(taskService.getAllTasks(pageable));
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
    @GetMapping("/my-tasks/paginated/{pageNumber}")
    public ResponseEntity<Page<TaskDto>> getMyTasks(
            @AuthenticationPrincipal PersonDto personDto,
            @PathVariable int pageNumber
    ) {
        Long userId = personDto.getPersonId();
        Pageable pageable = PageRequest.of(pageNumber, pageSize);
        return ResponseEntity.ok(taskService.getTasksByUserId(userId, pageable));
    }

    /**
     * User: Filters personal tasks by status paginated.
     */
    @GetMapping("/my-tasks/filter/paginated/{pageNumber}")
    public ResponseEntity<Page<TaskDto>> getMyTasksByStatus(
            @AuthenticationPrincipal PersonDto personDto,
            @RequestParam Status status,
            @PathVariable int pageNumber
    ) {
        Long userId = personDto.getPersonId();
        Pageable pageable = PageRequest.of(pageNumber, pageSize);
        return ResponseEntity.ok(taskService.getTasksByUserIdAndStatus(userId, status, pageable));
    }

    /**
     * Filters all tasks by the provided Status enum.
     * Used by the Admin Panel to view all transactions by Status.
     */
    @GetMapping("/status/{status}/paginated/{pageNumber}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Page<TaskDto>> getTasksByStatus(
            @PathVariable Status status,
            @PathVariable int pageNumber
    ) {
        Pageable pageable = PageRequest.of(pageNumber, pageSize);
        return ResponseEntity.ok(taskService.getTasksByStatus(status, pageable));
    }

    /**
     * Creates a new task.
     */
    @PostMapping
    public ResponseEntity<TaskDto> createNewTask(
            @Valid @RequestBody CreateTaskDto taskDto,
            @AuthenticationPrincipal PersonDto personDto
    ) {
        Long userId = personDto.getPersonId();
        return new ResponseEntity<>(taskService.createTask(taskDto, userId), HttpStatus.CREATED);
    }

    /**
     * Updates an existing task.
     * @param taskDetails reuses {@link CreateTaskDto} for same field update
     */
    @PutMapping("/{taskId}")
    public ResponseEntity<TaskDto> updateTask(
            @PathVariable Long taskId,
            @Valid @RequestBody CreateTaskDto taskDetails,
            @AuthenticationPrincipal PersonDto personDto // Added to get the current user
    ) {
        Long userId = personDto.getPersonId();
        return ResponseEntity.ok(taskService.updateTask(taskId, taskDetails, userId));
    }

    /**
     * Deletes a task by ID.
     */
    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTaskById(
            @PathVariable Long taskId,
            @AuthenticationPrincipal PersonDto personDto // Added to get the current user
    ) {
        Long userId = personDto.getPersonId();
        taskService.deleteTask(taskId, userId);
        return ResponseEntity.noContent().build();
    }
}