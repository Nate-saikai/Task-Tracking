package com.example.tasktrackingsystem.repository;

import com.example.tasktrackingsystem.model.Person;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * The interface Person repository.
 */
@Repository
public interface PersonRepository extends JpaRepository<Person, Long> {

    /**
     * Find by username optional.
     *
     * @param username the username
     * @return the optional
     */
    Optional<Person> findByUsername(String username);

    /**
     * Exists by username boolean.
     *
     * @param username the username
     * @return the boolean
     */
    boolean existsByUsername(String username);

    /**
     * Exists by username and person id not boolean.
     *
     * @param username the username
     * @param personId the person id
     * @return the boolean
     */
    boolean existsByUsernameAndPersonIdNot(String username, Long personId);
}
