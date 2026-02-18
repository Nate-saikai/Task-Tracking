package com.example.tasktrackingsystem.service;

import com.example.tasktrackingsystem.dto.CreateTaskDto;
import com.example.tasktrackingsystem.dto.PersonDto;
import com.example.tasktrackingsystem.dto.TaskDto;
import com.example.tasktrackingsystem.model.Task;
import com.example.tasktrackingsystem.model.Status;
import com.example.tasktrackingsystem.model.Person;
import com.example.tasktrackingsystem.repository.TaskRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service class for managing {@link Task} operations.
 * Handles business logic for task creation, status updates, and retrieval.
 */
@Service
@RequiredArgsConstructor
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private PersonService personService;

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
        owner.setFullName(dto.getFullName());
        owner.setUsername(dto.getUsername());

        // Link Task to Person
        task.setPerson(owner);

        // Set the initial tracking status
        task.setTrackingStatus(Status.TO_DO);

        // Save and return
        return convertToDto(taskRepository.save(task));
    }

    /**
     * Updates the tracking status of an existing task.
     * Logical flow: To Do -> In Progress -> Completed.
     * @param id The ID of the task to update.
     * @param details The new status to apply.
     * @return The updated task.
     */
    @Transactional
    public TaskDto updateTask(Long id, CreateTaskDto details) {

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Task not found with ID: " + id));

        task.setTitle(details.getTitle());
        task.setDescription(details.getDescription());

        if (details.getTrackingStatus() != null) {
            task.setTrackingStatus(details.getTrackingStatus());
        }

        return convertToDto(taskRepository.save(task));
    }

    /**
     * Deletes a task by ID.
     * @param id The ID of the task to delete.
     */
    @Transactional
    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new EntityNotFoundException("Cannot delete. Task not found with ID: " + id);
        }
        taskRepository.deleteById(id);
    }

    /**
     * Retrieves all tasks in the system.
     * @return A list of all tasks.
     */
    public List<TaskDto> getAllTasks() {
        return taskRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a task by its unique ID.
     * @param id The ID of the task.
     * @return The task if found.
     * @throws EntityNotFoundException if the task does not exist (TC_003).
     */
    public TaskDto getTaskById(Long id) {
        return taskRepository.findById(id)
                .map(this::convertToDto)
                .orElseThrow(() -> new EntityNotFoundException("Task not found with ID: " + id));
    }

    /**
     * Retrieves all tasks for a specific user.
     * @param userId The ID of the owner.
     * @return List of tasks.
     */
    public List<Task> getTasksByUserId(Long userId) {
        return taskRepository.findByUserId(userId);
    }

    /**
     * Retrieves tasks by status.
     * @param status The status string.
     * @return List of matching tasks.
     */
    public List<Task> getTasksByStatus(String status) {
        return taskRepository.findByTrackingStatus(status);
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