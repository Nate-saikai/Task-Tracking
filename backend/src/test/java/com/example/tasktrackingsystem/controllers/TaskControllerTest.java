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
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TaskController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class})
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

        mockTaskDto = new TaskDto(2L, "test", "test", Status.TO_DO, 1L);
        createTaskDto = new CreateTaskDto("test", "test", Status.TO_DO);
    }

    /**
     * Helper method to satisfy @AuthenticationPrincipal PersonDto expectations.
     */
    private UsernamePasswordAuthenticationToken getAuth(String role) {
        PersonDto principal = new PersonDto();
        principal.setPersonId(1L);
        principal.setUsername("user");
        principal.setRole(role);
        return new UsernamePasswordAuthenticationToken(
                principal, null, Collections.singletonList(new SimpleGrantedAuthority(role)));
    }

    @Test
    @DisplayName("POST /api/tasks - Create task returns 201")
    void createNewTask_ValidData_ReturnsCreated() throws Exception {
        // Robust Mocking: use any(Long.class) to ensure match
        when(taskService.createTask(any(CreateTaskDto.class), any(Long.class))).thenReturn(mockTaskDto);

        mockMvc.perform(post("/api/tasks")
                        .with(csrf())
                        .with(authentication(getAuth("USER")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createTaskDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("test"))
                .andExpect(jsonPath("$.userId").value(1));
    }

    @Test
    @DisplayName("POST /api/tasks - Missing title returns 400")
    void createNewTask_BlankTitle_ReturnsBadRequest() throws Exception {
        createTaskDto.setTitle("");

        mockMvc.perform(post("/api/tasks")
                        .with(csrf())
                        .with(authentication(getAuth("USER")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createTaskDto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"));
    }

    @Test
    @DisplayName("POST /api/tasks - Title too long returns 400")
    void createNewTask_TitleTooLong_ReturnsBadRequest() throws Exception {
        String longTitle = "A".repeat(101); // Exceeds @Size(max = 100) constraint
        createTaskDto.setTitle(longTitle);

        mockMvc.perform(post("/api/tasks")
                        .with(csrf())
                        .with(authentication(getAuth("USER")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createTaskDto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"));
    }

    @Test
    @DisplayName("GET /api/tasks/{id} - Invalid ID returns 404")
    void getTaskById_NotFound_Returns404() throws Exception {
        when(taskService.getTaskById(99L)).thenThrow(new EntityNotFoundException("Task not found with ID: 99"));

        mockMvc.perform(get("/api/tasks/99")
                        .with(authentication(getAuth("USER"))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("Admin Check: Accessing Admin endpoint as USER returns 403")
    void getAllTasks_UserRole_ReturnsForbidden() throws Exception {
        mockMvc.perform(get("/api/tasks/paginated/0")
                        .with(authentication(getAuth("USER"))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Admin Check: Accessing Admin endpoint as ADMIN returns 200")
    void getAllTasks_AdminRole_ReturnsOk() throws Exception {
        when(taskService.getAllTasks(any())).thenReturn(org.springframework.data.domain.Page.empty());

        mockMvc.perform(get("/api/tasks/paginated/0")
                        .with(authentication(getAuth("ADMIN"))))
                .andExpect(status().isOk());
    }
}