package com.example.tasktrackingsystem.repository;

import com.example.tasktrackingsystem.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repository interface for {@link Task} entities.
 * Provides standard CRUD operations and custom queries for task tracking.
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    /**
     * Finds all tasks associated with a specific user.
     * @param userId The ID of the user whose tasks are being retrieved.
     * @return A list of tasks belonging to the specified user.
     */
    List<Task> findByUserId(Long userId);

    /**
     * Finds tasks by their tracking status.
     * @param trackingStatus The status string to filter by.
     * @return A list of tasks matching the given status.
     */
    List<Task> findByTrackingStatus(String trackingStatus);

    /**
     * Finds all tasks for a specific user filtered by status.
     * @param userId The ID of the owner.
     * @param trackingStatus The status to filter.
     * @return A filtered list of tasks for the user.
     */
    List<Task> findByUserIdAndTrackingStatus(Long userId, String trackingStatus);
}