package com.example.tasktrackingsystem.controllers;

import com.example.tasktrackingsystem.dto.CreateTaskDto;
import com.example.tasktrackingsystem.dto.PersonDto;
import com.example.tasktrackingsystem.dto.TaskDto;
import com.example.tasktrackingsystem.model.Status;
import com.example.tasktrackingsystem.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Task Management", description = "Endpoints for creating, updating, viewing, and deleting tasks")
public class TaskController {

    private final TaskService taskService;

    @Value("${page.size}")
    private int pageSize;

    /**
     * Retrieves all tasks in the system.
     * Used by the Admin Panel to view all transactions.
     */
    @Operation(summary = "Admin: Get all tasks", description = "Retrieves a paginated list of every task in the system. Requires ADMIN role.")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved all tasks")
    @ApiResponse(responseCode = "403", description = "Access denied - ADMIN role required")
    @GetMapping("/paginated/{pageNumber}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Page<TaskDto>> getAllTasks(
            @Parameter(description = "Zero-based page index", example = "0") @PathVariable int pageNumber) {
        Pageable pageable = PageRequest.of(pageNumber, pageSize);
        return ResponseEntity.ok(taskService.getAllTasks(pageable));
    }

    /**
     * Retrieves a specific task by its ID.
     */
    @Operation(summary = "Get task by ID", description = "Fetches a single task's details using its unique ID.")
    @ApiResponse(responseCode = "200", description = "Task found")
    @ApiResponse(responseCode = "404", description = "Task not found")
    @GetMapping("/{taskId}")
    public ResponseEntity<TaskDto> getTaskById(
            @Parameter(description = "ID of the task to retrieve", example = "1") @PathVariable Long taskId) {
        return ResponseEntity.ok(taskService.getTaskById(taskId));
    }

    /**
     * Retrieves only the tasks belonging to the currently authenticated user.
     */
    @Operation(summary = "Get my tasks", description = "Retrieves a paginated list of tasks belonging to the currently authenticated user.")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved personal tasks")
    @GetMapping("/my-tasks/paginated/{pageNumber}")
    public ResponseEntity<Page<TaskDto>> getMyTasks(
            @AuthenticationPrincipal PersonDto personDto,
            @Parameter(description = "Zero-based page index", example = "0") @PathVariable int pageNumber
    ) {
        Long userId = personDto.getPersonId();
        Pageable pageable = PageRequest.of(pageNumber, pageSize);
        return ResponseEntity.ok(taskService.getTasksByUserId(userId, pageable));
    }

    /**
     * User: Filters personal tasks by status paginated.
     */
    @Operation(summary = "Filter my tasks by status",
            description = "Retrieves a paginated list of tasks belonging to the authenticated user, filtered by a specific status.")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved filtered personal tasks")
    @GetMapping("/my-tasks/filter/paginated/{pageNumber}")
    public ResponseEntity<Page<TaskDto>> getMyTasksByStatus(
            @AuthenticationPrincipal PersonDto personDto,
            @Parameter(description = "The status to filter tasks by", example = "TO_DO") @RequestParam Status status,
            @Parameter(description = "Zero-based page index", example = "0") @PathVariable int pageNumber
    ) {
        Long userId = personDto.getPersonId();
        Pageable pageable = PageRequest.of(pageNumber, pageSize);
        return ResponseEntity.ok(taskService.getTasksByUserIdAndStatus(userId, status, pageable));
    }

    @Operation(summary = "Admin: Filter all tasks by Title",
            description = "Retrieves a paginated list of all tasks in the system filtered by a title substring. " +
                    "This endpoint is intended for the Admin Panel and requires ADMIN authority."
    )
    @ApiResponse(responseCode = "200", description = "Successfully retrieved filtered global tasks")
    @ApiResponse(responseCode = "403", description = "Access denied - ADMIN role required")
    @GetMapping("/my-tasks/filter/title/{title}/paginated/{pageNumber}")
    public ResponseEntity<Page<TaskDto>> getMyTasksByTitle(
            @AuthenticationPrincipal PersonDto personDto,
            @Parameter(description = "Substring to search against, ignoring case", example = "salesPitch") @PathVariable String title,
            @Parameter(description = "Zero-based page index", example = "0") @PathVariable int pageNumber
    ) {
        Long userId = personDto.getPersonId();
        Pageable pageable = PageRequest.of(pageNumber, pageSize);
        return ResponseEntity.ok(taskService.getMyTasksByTitle(userId, title, pageable));
    }

    @Operation(summary = "Admin: Filter all tasks by Title and Status",
            description = "Retrieves a paginated list of all tasks in the system filtered by specific status and title substring. " +
                    "This endpoint is intended for the Admin Panel and requires ADMIN authority."
    )
    @ApiResponse(responseCode = "200", description = "Successfully retrieved filtered global tasks")
    @ApiResponse(responseCode = "403", description = "Access denied - ADMIN role required")
    @GetMapping("/my-tasks/filter/title/{title}/status/{status}/paginated/{pageNumber}")
    public ResponseEntity<Page<TaskDto>> getMyTasksByTitleAndStatus(
            @AuthenticationPrincipal PersonDto personDto,
            @Parameter(description = "Substring to search against, ignoring case", example = "salesPitch") @PathVariable String title,
            @Parameter(description = "Status to filter by", example = "IN_PROGRESS") @PathVariable Status status,
            @Parameter(description = "Zero-based page index", example = "0") @PathVariable int pageNumber
    ) {
        Long userId = personDto.getPersonId();
        Pageable pageable = PageRequest.of(pageNumber, pageSize);
        return ResponseEntity.ok(taskService.getMyTasksByTitleAndStatus(userId, title, status, pageable));
    }

    /**
     * Filters all tasks by the provided Status enum.
     * Used by the Admin Panel to view all transactions by Status.
     */
    @Operation(summary = "Admin: Filter all tasks by status",
            description = "Retrieves a paginated list of all tasks in the system filtered by a specific status. " +
                    "This endpoint is intended for the Admin Panel and requires ADMIN authority."
    )
    @ApiResponse(responseCode = "200", description = "Successfully retrieved filtered global tasks")
    @ApiResponse(responseCode = "403", description = "Access denied - ADMIN role required")
    @GetMapping("/status/{status}/paginated/{pageNumber}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Page<TaskDto>> getTasksByStatus(
            @Parameter(description = "Status to filter by", example = "IN_PROGRESS") @PathVariable Status status,
            @Parameter(description = "Zero-based page index", example = "0") @PathVariable int pageNumber
    ) {
        Pageable pageable = PageRequest.of(pageNumber, pageSize);
        return ResponseEntity.ok(taskService.getTasksByStatus(status, pageable));
    }

    @Operation(summary = "Admin: Filter all tasks by Title",
            description = "Retrieves a paginated list of all tasks in the system filtered by a title substring. " +
                    "This endpoint is intended for the Admin Panel and requires ADMIN authority."
    )
    @ApiResponse(responseCode = "200", description = "Successfully retrieved filtered global tasks")
    @ApiResponse(responseCode = "403", description = "Access denied - ADMIN role required")
    @GetMapping("/title/{title}/paginated/{pageNumber}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Page<TaskDto>> getTasksByTitle(
            @Parameter(description = "Substring to search against, ignoring case", example = "salesPitch") @PathVariable String title,
            @Parameter(description = "Zero-based page index", example = "0") @PathVariable int pageNumber
    ) {
        Pageable pageable = PageRequest.of(pageNumber, pageSize);
        return ResponseEntity.ok(taskService.getTasksByTitle(title, pageable));
    }

    @Operation(summary = "Admin: Filter all tasks by Title and Status",
            description = "Retrieves a paginated list of all tasks in the system filtered by specific status and title substring. " +
                    "This endpoint is intended for the Admin Panel and requires ADMIN authority."
    )
    @ApiResponse(responseCode = "200", description = "Successfully retrieved filtered global tasks")
    @ApiResponse(responseCode = "403", description = "Access denied - ADMIN role required")
    @GetMapping("/title/{title}/status/{status}/paginated/{pageNumber}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Page<TaskDto>> getTasksByTitleAndStatus(
            @Parameter(description = "Substring to search against, ignoring case", example = "salesPitch") @PathVariable String title,
            @Parameter(description = "Status to filter by", example = "IN_PROGRESS") @PathVariable Status status,
            @Parameter(description = "Zero-based page index", example = "0") @PathVariable int pageNumber
    ) {
        Pageable pageable = PageRequest.of(pageNumber, pageSize);
        return ResponseEntity.ok(taskService.getTasksByTitleAndStatus(title, status, pageable));
    }

    /**
     * Creates a new task.
     */
    @Operation(summary = "Create task", description = "Creates a new task and associates it with the authenticated user.")
    @ApiResponse(responseCode = "201", description = "Task created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input data provided")
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
    @Operation(summary = "Update task", description = "Updates the title, description, or status of an existing task owned by the user.")
    @ApiResponse(responseCode = "200", description = "Task updated successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input data provided")
    @ApiResponse(responseCode = "403", description = "Access denied - You do not own this task")
    @ApiResponse(responseCode = "404", description = "Task not found")
    @PutMapping("/{taskId}")
    public ResponseEntity<TaskDto> updateTask(
            @Parameter(description = "ID of the task to update", example = "1") @PathVariable Long taskId,
            @Valid @RequestBody CreateTaskDto taskDetails,
            @AuthenticationPrincipal PersonDto personDto // Added to get the current user
    ) {
        Long userId = personDto.getPersonId();
        return ResponseEntity.ok(taskService.updateTask(taskId, taskDetails, userId));
    }

    /**
     * Deletes a task by ID.
     */
    @Operation(summary = "Delete task", description = "Permanently removes a task if it belongs to the authenticated user.")
    @ApiResponse(responseCode = "204", description = "Task deleted successfully")
    @ApiResponse(responseCode = "403", description = "Access denied - You do not own this task")
    @ApiResponse(responseCode = "404", description = "Task not found")
    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTaskById(
            @Parameter(description = "ID of the task to delete", example = "1") @PathVariable Long taskId,
            @AuthenticationPrincipal PersonDto personDto // Added to get the current user
    ) {
        Long userId = personDto.getPersonId();
        taskService.deleteTask(taskId, userId);
        return ResponseEntity.noContent().build();
    }
}