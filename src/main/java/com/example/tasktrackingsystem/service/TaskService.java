package com.example.tasktrackingsystem.service;

import com.example.tasktrackingsystem.model.Task;
import com.example.tasktrackingsystem.model.User;
import com.example.tasktrackingsystem.repository.TaskRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
    private UserService userService;

    /**
     * Creates a new task associated with a specific user.
     * @param task The task details from the request.
     * @param username The ID/user of the owner.
     * @return The saved task.
     */
    @Transactional
    public Task createTask(Task task, Long userId) {
        // Find the user by username
        User owner = userService.getUserById(userId);

        task.setUser(owner);

        // Set the initial tracking status
        task.setTrackingStatus("To Do");

        // Save and return
        return taskRepository.save(task);
    }

    /**
     * Updates the tracking status of an existing task.
     * Logical flow: To Do -> In Progress -> Completed.
     * @param id The ID of the task to update.
     * @param details The new status to apply.
     * @return The updated task.
     */
    @Transactional
    public Task updateTask(Long id, Task details) {
        Task task = getTaskById(id);
        task.setTitle(details.getTitle());
        task.setDescription(details.getDescription());
        task.setTrackingStatus(details.getTrackingStatus());
        return taskRepository.save(task);
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
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    /**
     * Retrieves a task by its unique ID.
     * @param id The ID of the task.
     * @return The task if found.
     * @throws EntityNotFoundException if the task does not exist (TC_003).
     */
    public Task getTaskById(Long id) {
        return taskRepository.findById(id)
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
}