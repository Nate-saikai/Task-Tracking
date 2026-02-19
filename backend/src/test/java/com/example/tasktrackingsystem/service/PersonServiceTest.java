package com.example.tasktrackingsystem.service;

import com.example.tasktrackingsystem.dto.PersonDto;
import com.example.tasktrackingsystem.model.Person;
import com.example.tasktrackingsystem.model.Role;
import com.example.tasktrackingsystem.repository.PersonRepository;
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
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PersonServiceTest {
    @Mock
    private PersonRepository personRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private PersonService personService;

    private Person mockPerson;
    private PersonDto mockPersonDto;

    @BeforeEach
    void setUp() {
        mockPerson = new Person(1L, "Tester Name", Role.USER, "username", "password");
        mockPersonDto = new PersonDto(1L, "Tester Name", "USER", "username");
    }

    // Test for findById
    @Test
    @DisplayName(value = "Person TC_001: Find a person by ID")
    void TC_001(){
        when(personRepository.findById(1L)).thenReturn(Optional.ofNullable(mockPerson));

        PersonDto result = personService.findById(1L);

        assertEquals(mockPersonDto.getPersonId(), result.getPersonId());
        verify(personRepository, times(1)).findById(1L);
    }

    // Test for findAll
    @Test
    @DisplayName(value = "Person TC_002: Find all person without pagination")
    void TC_002(){
        when(personService.findAll()).thenReturn(List.of(mockPersonDto));
        List<PersonDto> result = personService.findAll();
        assertEquals(1, result.size());
        assertEquals(mockPersonDto, result.getFirst());
    }

    // Test for findAllPaginated
    @Test
    @DisplayName(value = "Person TC_003: Find all person with pagination")
    void TC_003(){
        Pageable pageable = PageRequest.of(0, 5);
        Page<PersonDto> personDtoPage = new PageImpl<>(List.of(mockPersonDto));

        when(personService.findAllPaginated(pageable)).thenReturn(personDtoPage);

        assertEquals(1, personService.findAllPaginated(pageable).getTotalElements());
        assertEquals(mockPersonDto, personService.findAllPaginated(pageable).getContent().getFirst());
    }

    // Test for login

    // Test for create

    // Test for patchProfile

    // Test for changePassword

    // Test for delete


}
