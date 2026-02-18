package com.example.tasktrackingsystem.controllers;

import jakarta.annotation.Nullable;
import org.apache.coyote.Response;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @GetMapping
    public ResponseEntity<?> getAllTasks() {
        return ResponseEntity.ok().build();
    }

    @GetMapping("/user")
    public ResponseEntity<?> getAllTasksByUser(@RequestParam String userId) {
        return ResponseEntity.ok().build();
    }

    @GetMapping("/status")
    public ResponseEntity<?> getAllTasksByStatus(@RequestParam String status) {
        return ResponseEntity.ok().build();
    }

    @GetMapping("/status/user")
    public ResponseEntity<?> getTaskByStatusAndUser(@RequestParam String userId,
                                                    @RequestParam String status) {
        return ResponseEntity.ok().build();
    }

    @PostMapping
    public ResponseEntity<?> createNewTask(@RequestParam String name, @RequestParam(defaultValue = "Tracking") String status) {
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<?> getTaskById(@PathVariable String taskId) {
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<?> updateTaskById(@PathVariable String taskId) {
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<?> deleteTaskById(@PathVariable String taskId) {
        return ResponseEntity.ok().build();
    }


}
