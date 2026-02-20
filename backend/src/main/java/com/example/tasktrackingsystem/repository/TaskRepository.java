package com.example.tasktrackingsystem.repository;

import com.example.tasktrackingsystem.model.Status;
import com.example.tasktrackingsystem.model.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for {@link Task} entities.
 * Provides standard CRUD operations and custom queries for task tracking.
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    /**
     * Finds all tasks associated with a specific user.
     * @param personId The ID of the user whose tasks are being retrieved.
     * @param pageable the pagination information.
     * @return A list of tasks belonging to the specified user.
     */
    Page<Task> findByPersonPersonId(Long personId, Pageable pageable);

    /**
     * Finds tasks by their tracking status.
     * @param trackingStatus The status string to filter by.
     * @param pageable the pagination information.
     * @return A list of tasks matching the given status.
     */
    Page<Task> findByTrackingStatus(Status trackingStatus, Pageable pageable);

    /**
     * Finds all tasks for a specific user filtered by status.
     * @param personId The ID of the owner.
     * @param trackingStatus The status to filter.
     * @param pageable the pagination information.
     * @return A filtered list of tasks for the user.
     */
    Page<Task> findByPersonPersonIdAndTrackingStatus(Long personId, Status trackingStatus, Pageable pageable);

    Page<Task> findByTitleContainsIgnoreCase(String queryTitle, Pageable pageable);

    Page<Task> findByTrackingStatusAndTitleContainsIgnoreCase(Status status, String queryTitle, Pageable pageable);


    Page<Task> findByPersonPersonIdAndTitleContainsIgnoreCase(Long personId, String queryTitle, Pageable pageable);

    Page<Task> findByPersonPersonIdAndTrackingStatusAndTitleContainsIgnoreCase(Long personId, Status status, String queryTitle, Pageable pageable);

    // TODO: Either make use or delete
    Optional<Task> findFirstByPersonPersonIdAndTitleIgnoreCase(Long personId, String title);
}