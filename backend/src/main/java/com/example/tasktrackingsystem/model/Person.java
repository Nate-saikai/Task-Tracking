package com.example.tasktrackingsystem.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * The type Person.
 */
@Entity
@Table(name = "persons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Person {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long personId;

    @Size(min = 8, max = 100, message = "Full name must be a minimum of 8 - 100 characters only.")
    @Column(name = "full_name" ,nullable = false, length = 100)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 8)
    private Role role;

    @Size(min = 8, max = 50, message = "Username must be a minimum of 8 - 50 characters only.")
    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;

    @Size(min = 8, message = "Password must be a minimum of 8 characters.")
    @Column(name = "password", nullable = false)
    private String password;
}

