package com.example.tasktrackingsystem.dto;

public record TaskDto(
        String id,
        String title,
        String status,
        String description,
        String userId
) {}