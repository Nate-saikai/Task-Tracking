package com.example.tasktrackingsystem.service;

import com.example.tasktrackingsystem.dto.CreateTaskDto;
import com.example.tasktrackingsystem.dto.PersonDto;
import com.example.tasktrackingsystem.dto.TaskDto;
import com.example.tasktrackingsystem.exceptions.InvalidInputException;
import com.example.tasktrackingsystem.exceptions.TaskNotFoundException;
import com.example.tasktrackingsystem.model.Person;
import com.example.tasktrackingsystem.model.Status;
import com.example.tasktrackingsystem.model.Task;
import com.example.tasktrackingsystem.repository.TaskRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private PersonService personService;

    @InjectMocks
    private TaskService taskService;

    private PersonDto mockPersonDto;
    private Task mockTask;
    private CreateTaskDto createTaskDto;

    @BeforeEach
    void setUp() {
        mockPersonDto = new PersonDto();
        mockPersonDto.setPersonId(1L);
        mockPersonDto.setFullName("Test User");

        createTaskDto = new CreateTaskDto();
        createTaskDto.setTitle("Test Task");
        createTaskDto.setDescription("Test Description");
        createTaskDto.setTrackingStatus(Status.IN_PROGRESS);

        Person person = new Person();
        person.setPersonId(1L);

        mockTask = Task.builder()
                .id(1L)
                .title("Test Task")
                .description("Test Description")
                .trackingStatus(Status.TO_DO)
                .person(person)
                .build();
    }

    @Test
    @DisplayName("Create task with valid data")
    void createTask_ValidData_ReturnsTaskDto() {
        // Arrange
        when(personService.findById(1L)).thenReturn(mockPersonDto);
        when(taskRepository.save(any(Task.class))).thenReturn(mockTask);

        // Act
        TaskDto result = taskService.createTask(createTaskDto, 1L);

        // Assert
        assertNotNull(result);
        assertEquals("Test Task", result.getTitle());
        assertEquals(Status.TO_DO, result.getTrackingStatus());
        verify(taskRepository, times(1)).save(any(Task.class));
    }

    @Test
    @DisplayName("Retrieve task by valid ID")
    void getTaskById_ValidId_ReturnsTaskDto() {
        // Arrange
        when(taskRepository.findById(1L)).thenReturn(Optional.of(mockTask));

        // Act
        TaskDto result = taskService.getTaskById(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(taskRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Retrieve task by invalid ID throws Exception")
    void getTaskById_InvalidId_ThrowsEntityNotFoundException() {
        // Arrange
        when(taskRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        TaskNotFoundException exception = assertThrows(TaskNotFoundException.class, () -> {
            taskService.getTaskById(99L);
        });

        assertTrue(exception.getMessage().contains("Task not found with ID: 99"));
    }

    @Test
    @DisplayName("Delete task - Success (Same User)")
    void deleteTask_ValidId_CallsDelete() {
        // Arrange
        when(taskRepository.findById(1L)).thenReturn(Optional.of(mockTask));

        // Act
        taskService.deleteTask(1L, 1L);

        // Assert
        verify(taskRepository, times(1)).delete(mockTask);
    }

    @Test
    @DisplayName("Delete task - Fails (Wrong User)")
    void deleteTask_WrongUser_ThrowsInvalidInputException() {
        // Arrange
        when(taskRepository.findById(1L)).thenReturn(Optional.of(mockTask));

        // Act & Assert
        assertThrows(InvalidInputException.class, () -> {
            taskService.deleteTask(1L, 2L);
        });
    }

    @Test
    @DisplayName("Update task details - Success (Same User)")
    void updateTask_ValidData_ReturnsUpdatedDto() {
        // Arrange
        when(taskRepository.findById(1L)).thenReturn(Optional.of(mockTask));
        when(taskRepository.save(any(Task.class))).thenReturn(mockTask);

        // Act
        TaskDto result = taskService.updateTask(1L, createTaskDto, 1L);

        // Assert
        assertNotNull(result);
        assertEquals(Status.IN_PROGRESS, mockTask.getTrackingStatus());
        verify(taskRepository).save(mockTask);
    }

    @Test
    @DisplayName("Update task details - Fails (Wrong User)")
    void updateTask_WrongUser_ThrowsInvalidInputException() {
        // Arrange
        when(taskRepository.findById(1L)).thenReturn(Optional.of(mockTask));

        // Act & Assert
        assertThrows(InvalidInputException.class, () -> {
            taskService.updateTask(1L, createTaskDto, 2L); // 2L does not own 1L
        });
    }

    @Test
    @DisplayName("Retrieve all tasks with pagination")
    void getAllTasks_ReturnsPageOfDtos() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<Task> page = new PageImpl<>(List.of(mockTask));
        when(taskRepository.findAll(pageable)).thenReturn(page);

        // Act
        Page<TaskDto> result = taskService.getAllTasks(pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(taskRepository).findAll(pageable);
    }

    @Test
    @DisplayName("Retrieve tasks by User ID and Status with pagination")
    void getTasksByUserIdAndStatus_ReturnsFilteredPage() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<Task> page = new PageImpl<>(List.of(mockTask));
        when(taskRepository.findByPersonPersonIdAndTrackingStatus(1L, Status.TO_DO, pageable)).thenReturn(page);

        // Act
        Page<TaskDto> result = taskService.getTasksByUserIdAndStatus(1L, Status.TO_DO, pageable);

        // Assert
        assertNotNull(result);
        assertEquals(Status.TO_DO, result.getContent().get(0).getTrackingStatus());
    }
}