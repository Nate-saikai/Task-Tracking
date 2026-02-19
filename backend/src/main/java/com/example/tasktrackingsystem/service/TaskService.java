package com.example.tasktrackingsystem.service;

import com.example.tasktrackingsystem.dto.CreateTaskDto;
import com.example.tasktrackingsystem.dto.PersonDto;
import com.example.tasktrackingsystem.dto.TaskDto;
import com.example.tasktrackingsystem.exceptions.InvalidInputException;
import com.example.tasktrackingsystem.exceptions.TaskNotFoundException;
import com.example.tasktrackingsystem.model.Task;
import com.example.tasktrackingsystem.model.Status;
import com.example.tasktrackingsystem.model.Person;
import com.example.tasktrackingsystem.repository.TaskRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service class for managing {@link Task} operations.
 * Handles business logic for task creation, status updates, and retrieval.
 */
@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final PersonService personService;

    /**
     * Creates a new task associated with a specific user.
     * @param createTaskDto The task details from the request.
     * @param userId The unique identifier of the person who owns this task.
     * @return The saved task.
     */
    @Transactional
    public TaskDto createTask(CreateTaskDto createTaskDto, Long userId) {
        // Find the user by username
        PersonDto dto = personService.findById(userId);

        // Map CreateTaskDto to Task entity
        Task task = convertToEntity(createTaskDto);

        // Create the Person entity from the DTO data
        Person owner = new Person();
        owner.setPersonId(Long.valueOf(dto.getPersonId()));

        // Link Task to Person
        task.setPerson(owner);

        // Set the initial tracking status
        task.setTrackingStatus(Status.TO_DO);

        // Save and return
        return convertToDto(taskRepository.save(task));
    }

    /**
     * Updates an existing task's title, description, and status after verifying ownership.
     * @param id The ID of the task to update.
     * @param details The updated task details.
     * @param userId The ID of the user requesting the update for ownership validation.
     * @return The updated task DTO.
     * @throws TaskNotFoundException if no task exists with the given ID.
     * @throws InvalidInputException if the user does not own the task.
     */
    @Transactional
    public TaskDto updateTask(Long id, CreateTaskDto details, Long userId) {
        // Check if Task exist
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException("Task not found with ID: " + id));

        // Ownership Check
        if (!task.getPerson().getPersonId().equals(userId)) {
            throw new InvalidInputException("You do not have permission to update this task.");
        }

        task.setTitle(details.getTitle());
        task.setDescription(details.getDescription());

        if (details.getTrackingStatus() != null) {
            task.setTrackingStatus(details.getTrackingStatus());
        }

        return convertToDto(taskRepository.save(task));
    }

    /**
     * Deletes a task by its ID.
     * @param taskId The ID of the task to delete.
     * @param userId The ID of the user requesting the deletion for ownership validation.
     * @throws TaskNotFoundException if no task exists with the given ID.
     * @throws InvalidInputException if the user does not own the task.
     */
    @Transactional
    public void deleteTask(Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException("Task not found with ID: " + taskId));

        // Ownership Check
        if (!task.getPerson().getPersonId().equals(userId)) {
            throw new InvalidInputException("You do not have permission to delete this task.");
        }

        taskRepository.delete(task);
    }

    /**
     * Retrieves a paginated list of all tasks in the system.
     * @param pageable The pagination information.
     * @return A page of all TaskDtos.
     */
    public Page<TaskDto> getAllTasks(Pageable pageable) {
        return taskRepository.findAll(pageable).map(this::convertToDto);
    }

    /**
     * Retrieves a task by its unique ID.
     * @param id The ID of the task.
     * @return The task if found.
     * @throws TaskNotFoundException if the task does not exist.
     */
    public TaskDto getTaskById(Long id) {
        return taskRepository.findById(id)
                .map(this::convertToDto)
                .orElseThrow(() -> new TaskNotFoundException("Task not found with ID: " + id));
    }

    /**
     * Retrieves all tasks for a specific user.
     * @param userId The ID of the owner.
     * @param pageable The pagination information.
     * @return A page of the user's TaskDtos
     */
    public Page<TaskDto> getTasksByUserId(Long userId, Pageable pageable) {
        return taskRepository.findByPersonPersonId(userId, pageable).map(this::convertToDto);
    }

    /**
     * Retrieves a paginated list of tasks for a specific user, filtered by status.
     * @param userId   The ID of the task owner.
     * @param status   The status to filter by.
     * @param pageable The pagination information.
     * @return A page of matching TaskDtos.
     */
    public Page<TaskDto> getTasksByUserIdAndStatus(Long userId, Status status, Pageable pageable) {
        return taskRepository.findByPersonPersonIdAndTrackingStatus(userId, status, pageable).map(this::convertToDto);
    }

    /**
     * Retrieves a paginated list of tasks filtered by status across all users.
     * @param status   The status to filter by.
     * @param pageable The pagination information.
     * @return A page of matching TaskDtos.
     */
    public Page<TaskDto> getTasksByStatus(Status status, Pageable pageable) {
        return taskRepository.findByTrackingStatus(status, pageable).map(this::convertToDto);
    }

    // Mapping Methods
    private TaskDto convertToDto(Task task) {
        return new TaskDto(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getTrackingStatus(),
                task.getPerson() != null ? task.getPerson().getPersonId() : null
        );
    }

    private Task convertToEntity(CreateTaskDto dto) {
        return Task.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .build();
    }
}