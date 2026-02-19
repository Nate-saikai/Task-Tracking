package com.example.tasktrackingsystem.controllers;

import com.example.tasktrackingsystem.dto.CreateTaskDto;
import com.example.tasktrackingsystem.dto.TaskDto;
import com.example.tasktrackingsystem.model.Status;
import com.example.tasktrackingsystem.service.JwtService;
import com.example.tasktrackingsystem.service.TaskService;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

//@SpringBootTest(classes = TaskTrackingSystemApplication.class)
@WebMvcTest(TaskController.class)
public class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TaskService taskService;

    @MockitoBean
    private JwtService jwtService;

    @Autowired
    private ObjectMapper objectMapper;

    private TaskDto mockTaskDto;
    private CreateTaskDto createTaskDto;

    @BeforeEach
    void setUp() {
        mockTaskDto = new TaskDto(1L, "Valid Title", "Description", Status.TO_DO, 1L);
        createTaskDto = new CreateTaskDto("Valid Title", "Description", Status.TO_DO);
    }

    @Test
    @WithMockUser(authorities = "USER")
    @DisplayName("POST /api/tasks - Create task returns 201")
    void createNewTask_ValidData_ReturnsCreated() throws Exception {
        when(taskService.createTask(any(CreateTaskDto.class), anyLong())).thenReturn(mockTaskDto);

        mockMvc.perform(post("/api/tasks")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createTaskDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Valid Title"));
    }

    @Test
    @WithMockUser(authorities = "USER")
    @DisplayName("POST /api/tasks - Missing title returns 400")
    void createNewTask_BlankTitle_ReturnsBadRequest() throws Exception {
        createTaskDto.setTitle(""); // Violation of @NotBlank

        mockMvc.perform(post("/api/tasks")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createTaskDto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"));
    }

    @Test
    @WithMockUser(authorities = "USER")
    @DisplayName("POST /api/tasks - Title too long returns 400")
    void createNewTask_TitleTooLong_ReturnsBadRequest() throws Exception {
        String longTitle = "A".repeat(101); // Violation of @Size(max = 100)
        createTaskDto.setTitle(longTitle);

        mockMvc.perform(post("/api/tasks")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createTaskDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(authorities = "USER")
    @DisplayName("GET /api/tasks/{id} - Invalid ID returns 404")
    void getTaskById_NotFound_Returns404() throws Exception {
        when(taskService.getTaskById(99L)).thenThrow(new EntityNotFoundException("Task not found with ID: 99"));

        mockMvc.perform(get("/api/tasks/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @WithMockUser(authorities = "USER")
    @DisplayName("Admin Check: Accessing Admin endpoint as USER returns 403")
    void getAllTasks_UserRole_ReturnsForbidden() throws Exception {
        mockMvc.perform(get("/api/tasks/paginated/0"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    @DisplayName("Admin Check: Accessing Admin endpoint as ADMIN returns 200")
    void getAllTasks_AdminRole_ReturnsOk() throws Exception {
        mockMvc.perform(get("/api/tasks/paginated/0"))
                .andExpect(status().isOk());
    }
}