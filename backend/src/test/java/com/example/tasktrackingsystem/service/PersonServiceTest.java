package com.example.tasktrackingsystem.service;

import com.example.tasktrackingsystem.dto.CreatePersonDto;
import com.example.tasktrackingsystem.dto.PatchPersonProfileDto;
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
        when(personRepository.findAll()).thenReturn(List.of(mockPerson));

        List<PersonDto> result = personService.findAll();

        assertEquals(1, result.size());
        assertEquals(mockPersonDto.getPersonId(), result.getFirst().getPersonId());
        verify(personRepository, times(1)).findAll();
    }

    // Test for findAllPaginated
    @Test
    @DisplayName(value = "Person TC_003: Find all person with pagination")
    void TC_003(){
        Pageable pageable = PageRequest.of(0, 5);
        Page<Person> personPage = new PageImpl<>(List.of(mockPerson));

        when(personRepository.findAll(pageable)).thenReturn(personPage);

        Page<PersonDto> result = personService.findAllPaginated(pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals(mockPersonDto.getPersonId(), result.getContent().getFirst().getPersonId());
        verify(personRepository, times(1)).findAll(pageable);
    }

    // Test for login
    @Test
    @DisplayName(value = "Person TC_004: Test Login")
    void TC_004(){
        when(personRepository.findByUsername(mockPerson.getUsername())).thenReturn(Optional.of(mockPerson));
        when(passwordEncoder.matches(mockPerson.getPassword(), mockPerson.getPassword())).thenReturn(true);

        PersonDto loggedInPersonDto = personService.login(mockPerson.getUsername(), mockPerson.getPassword());

        assertEquals(loggedInPersonDto.getPersonId(), mockPerson.getPersonId());
        verify(personRepository, times(1)).findByUsername(mockPerson.getUsername());
    }

    // Test for create
    @Test
    @DisplayName(value = "Person TC_005: Test Create Person")
    void TC_005(){
        CreatePersonDto createDto = new CreatePersonDto(
                mockPerson.getFullName(),
                String.valueOf(mockPerson.getRole()),
                mockPerson.getUsername(),
                "password"
        );

        when(personRepository.existsByUsername(createDto.getUsername())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(personRepository.save(any(Person.class))).thenReturn(mockPerson);

        PersonDto result = personService.create(createDto);

        assertEquals(mockPerson.getPersonId(), result.getPersonId());
        assertEquals(mockPerson.getUsername(), result.getUsername());

        verify(personRepository, times(1)).existsByUsername(createDto.getUsername());
        verify(personRepository, times(1)).save(any(Person.class));
    }

    // Test for patchProfile
    @Test
    @DisplayName(value = "Person TC_006: Test Patch")
    void TC_006(){
        Person updatedPerson = new Person(1L, "Tester Name", Role.USER, "username", "password");

        // Person Service Patch Profile Paramters
        Long patchPersonProfileId = mockPerson.getPersonId();
        PatchPersonProfileDto patchPersonProfileDto = new PatchPersonProfileDto("Full Name", "username2");
        updatedPerson.setUsername(patchPersonProfileDto.getUsername());
        updatedPerson.setFullName(patchPersonProfileDto.getFullName());

        when(personRepository.findById(patchPersonProfileId)).thenReturn(Optional.of(mockPerson));
        when(personRepository.existsByUsernameAndPersonIdNot("username2", mockPerson.getPersonId())).thenReturn(false);
        when(personRepository.save(any(Person.class))).thenReturn(updatedPerson);

        PersonDto result = personService.patchProfile(mockPerson.getPersonId(), patchPersonProfileDto);

        assertEquals(mockPerson.getPersonId(), result.getPersonId());
        assertEquals("username2", result.getUsername());
        assertEquals("Full Name", result.getFullName());

        verify(personRepository, times(1)).findById(mockPerson.getPersonId());
        verify(personRepository, times(1)).existsByUsernameAndPersonIdNot(anyString(), anyLong());
        verify(personRepository, times(1)).save(any(Person.class));
    }
}
