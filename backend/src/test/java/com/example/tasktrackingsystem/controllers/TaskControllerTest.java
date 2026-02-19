package com.example.tasktrackingsystem.controllers;

import com.example.tasktrackingsystem.controllerhandlier.GlobalExceptionHandler;
import com.example.tasktrackingsystem.dto.CreateTaskDto;
import com.example.tasktrackingsystem.dto.TaskDto;
import com.example.tasktrackingsystem.dto.PersonDto;
import com.example.tasktrackingsystem.model.Status;
import com.example.tasktrackingsystem.service.JwtService;
import com.example.tasktrackingsystem.service.PersonService;
import com.example.tasktrackingsystem.service.TaskService;
import com.example.tasktrackingsystem.config.SecurityConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TaskController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class})
@TestPropertySource(properties = {
        "api.path.tasks=/api/tasks",
        "page.size=10"
})
public class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TaskService taskService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private PersonService personService;

    private ObjectMapper objectMapper;
    private TaskDto mockTaskDto;
    private CreateTaskDto createTaskDto;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        mockTaskDto = new TaskDto(1L, "Test Task", "Description", Status.TO_DO, 1L);
        createTaskDto = new CreateTaskDto("Test Task", "Description", Status.TO_DO);
    }

    private UsernamePasswordAuthenticationToken getAuth(String role) {
        PersonDto principal = new PersonDto();
        principal.setPersonId(1L);
        principal.setUsername("user");
        principal.setRole(role);
        return new UsernamePasswordAuthenticationToken(
                principal, null, Collections.singletonList(new SimpleGrantedAuthority(role)));
    }

    // TC_001 & TC_011: Retrieve all tasks (Admin)
    @Test
    @DisplayName("TC_001/011: GET /api/tasks/paginated/0 - Retrieve all tasks returns 200")
    void getAllTasks_Admin_ReturnsOk() throws Exception {
        when(taskService.getAllTasks(any())).thenReturn(new PageImpl<>(List.of(mockTaskDto)));

        mockMvc.perform(get("/api/tasks/paginated/0")
                        .with(authentication(getAuth("ADMIN"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Test Task"));
    }

    // TC_002: Retrieve task by valid ID
    @Test
    @DisplayName("TC_002: GET /api/tasks/{id} - Valid ID returns 200")
    void getTaskById_ValidId_ReturnsOk() throws Exception {
        when(taskService.getTaskById(1L)).thenReturn(mockTaskDto);

        mockMvc.perform(get("/api/tasks/1")
                        .with(authentication(getAuth("USER"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Test Task"));
    }

    // TC_003: Retrieve task by invalid ID
    @Test
    @DisplayName("TC_003: GET /api/tasks/{id} - Invalid ID returns 404")
    void getTaskById_InvalidId_ReturnsNotFound() throws Exception {
        when(taskService.getTaskById(99L)).thenThrow(new EntityNotFoundException("Task not found"));

        mockMvc.perform(get("/api/tasks/99")
                        .with(authentication(getAuth("USER"))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    // TC_004: Create new task with valid data
    @Test
    @DisplayName("TC_004: POST /api/tasks - Valid data returns 201")
    void createNewTask_ValidData_ReturnsCreated() throws Exception {
        when(taskService.createTask(any(CreateTaskDto.class), any(Long.class))).thenReturn(mockTaskDto);

        mockMvc.perform(post("/api/tasks")
                        .with(csrf())
                        .with(authentication(getAuth("USER")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createTaskDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Test Task"));
    }

    // TC_005: Create task with missing title
    @Test
    @DisplayName("TC_005: POST /api/tasks - Missing title returns 400")
    void createNewTask_MissingTitle_ReturnsBadRequest() throws Exception {
        createTaskDto.setTitle("");

        mockMvc.perform(post("/api/tasks")
                        .with(csrf())
                        .with(authentication(getAuth("USER")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createTaskDto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"));
    }

    // TC_006: Update existing task
    @Test
    @DisplayName("TC_006: PUT /api/tasks/{id} - Valid update returns 200")
    void updateTask_ValidId_ReturnsOk() throws Exception {
        when(taskService.updateTask(eq(1L), any(CreateTaskDto.class), any(Long.class))).thenReturn(mockTaskDto);

        mockMvc.perform(put("/api/tasks/1")
                        .with(csrf())
                        .with(authentication(getAuth("USER")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createTaskDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Test Task"));
    }

    // TC_007: Update non-existing task
    @Test
    @DisplayName("TC_007: PUT /api/tasks/{id} - Invalid ID returns 404")
    void updateTask_InvalidId_ReturnsNotFound() throws Exception {
        when(taskService.updateTask(eq(99L), any(CreateTaskDto.class), any(Long.class)))
                .thenThrow(new EntityNotFoundException("Task not found"));

        mockMvc.perform(put("/api/tasks/99")
                        .with(csrf())
                        .with(authentication(getAuth("USER")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createTaskDto)))
                .andExpect(status().isNotFound());
    }

    // TC_008: Delete task by valid ID
    @Test
    @DisplayName("TC_008: DELETE /api/tasks/{id} - Valid ID returns 204")
    void deleteTask_ValidId_ReturnsNoContent() throws Exception {
        doNothing().when(taskService).deleteTask(eq(1L), any(Long.class));

        mockMvc.perform(delete("/api/tasks/1")
                        .with(csrf())
                        .with(authentication(getAuth("USER"))))
                .andExpect(status().isNoContent());
    }

    // TC_009: Delete task with invalid ID
    @Test
    @DisplayName("TC_009: DELETE /api/tasks/{id} - Invalid ID returns 404")
    void deleteTask_InvalidId_ReturnsNotFound() throws Exception {
        doThrow(new EntityNotFoundException("Task not found")).when(taskService).deleteTask(eq(99L), any(Long.class));

        mockMvc.perform(delete("/api/tasks/99")
                        .with(csrf())
                        .with(authentication(getAuth("USER"))))
                .andExpect(status().isNotFound());
    }

    // TC_010: Create task with long title/desc
    @Test
    @DisplayName("TC_010: POST /api/tasks - Long title returns 400")
    void createNewTask_LongTitle_ReturnsBadRequest() throws Exception {
        createTaskDto.setTitle("A".repeat(101));

        mockMvc.perform(post("/api/tasks")
                        .with(csrf())
                        .with(authentication(getAuth("USER")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createTaskDto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"));
    }

    @Test
    @DisplayName("Security Check: Accessing Admin endpoint as USER returns 403")
    void getAllTasks_UserRole_ReturnsForbidden() throws Exception {
        mockMvc.perform(get("/api/tasks/paginated/0")
                        .with(authentication(getAuth("USER"))))
                .andExpect(status().isForbidden());
    }
}