package com.example.tasktrackingsystem.service;

import com.example.tasktrackingsystem.dto.*;
import com.example.tasktrackingsystem.dto.CreatePersonDto;
import com.example.tasktrackingsystem.dto.PersonDto;
import com.example.tasktrackingsystem.model.Person;
import com.example.tasktrackingsystem.model.Role;
import com.example.tasktrackingsystem.repository.PersonRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * The type Person service.
 */
@Service
public class PersonService {
    private final PersonRepository personRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Instantiates a new Person service.
     *
     * @param personRepository the person repository
     * @param passwordEncoder  the password encoder
     */
    public PersonService(PersonRepository personRepository, PasswordEncoder passwordEncoder) {
        this.personRepository = personRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Find by id person dto.
     *
     * @param id the id
     * @return the person dto
     */
// Get Person
    public PersonDto findById(Long id) {
        return personRepository.findById(id)
                .map(this::convertToDto)
                .orElseThrow(() -> new EntityNotFoundException("Person with id " + id + " not found"));
    }

    /**
     * Find all list.
     *
     * @return the list
     */
// Get All Person
    public List<PersonDto> findAll() {
        return personRepository.findAll().stream().map(this::convertToDto).toList();
    }

    /**
     * Find all paginated list.
     *
     * @param pageable the pageable
     * @return the list
     */
// Get All Person Paginated
    public List<PersonDto> findAllPaginated(Pageable pageable) {
        return personRepository.findAll(pageable).map(this::convertToDto).toList();
    }

    /**
     * Login person dto.
     *
     * @param username the username
     * @param password the password
     * @return the person dto
     */
// Login Person
    public PersonDto login(String username, String password) {
        Person person = personRepository.findByUsername(username)
                .orElseThrow(() -> new BadCredentialsException("You have entered a wrong username or password. Please try again."));

        if (!passwordEncoder.matches(password, person.getPassword())) {
            throw new BadCredentialsException("You have entered a wrong username or password. Please try again.");
        }

        return convertToDto(person);
    }

    /**
     * Create person dto.
     *
     * @param createPersonDto the create person dto
     * @return the person dto
     */
// Create Person
    public PersonDto create(CreatePersonDto createPersonDto) {
        if (personRepository.existsByUsername(createPersonDto.getUsername())) {
            throw new IllegalStateException("Username is already taken.");
        }
        createPersonDto.setPassword(passwordEncoder.encode(createPersonDto.getPassword()));
        return convertToDto(personRepository.save(convertToEntity(createPersonDto)));
    }

    /**
     * Patch profile person dto.
     *
     * @param id  the id
     * @param dto the dto
     * @return the person dto
     */
// Update Person
    public PersonDto patchProfile(Long id, PatchPersonProfileDto dto) {
        Person person = personRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Person with id " + id + " not found"));

        boolean changed = false;

        if (dto.getFullName() != null) {
            String name = dto.getFullName().trim();
            if (name.isEmpty()) {
                throw new IllegalArgumentException("Full name must not be blank.");
            }
            person.setFullName(name);
            changed = true;
        }

        if (dto.getUsername() != null) {
            String uname = dto.getUsername().trim();
            if (uname.isEmpty()) {
                throw new IllegalArgumentException("Username must not be blank.");
            }

            if (!uname.equals(person.getUsername())
                    && personRepository.existsByUsernameAndPersonIdNot(uname, id)) {
                throw new IllegalStateException("Username is already taken.");
            }

            person.setUsername(uname);
            changed = true;
        }

        if (!changed) {
            return convertToDto(person);
        }

        Person saved = personRepository.save(person);
        return convertToDto(saved);
    }

    /**
     * Change password person dto.
     *
     * @param id  the id
     * @param dto the dto
     * @return the person dto
     */
// Change pass
    public PersonDto changePassword(Long id, ChangePasswordDto dto) {
        Person person = personRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Person with id " + id + " not found"));

        if (!passwordEncoder.matches(dto.getCurrentPassword(), person.getPassword())) {
            throw new BadCredentialsException("Current password is incorrect.");
        }

        if (passwordEncoder.matches(dto.getNewPassword(), person.getPassword())) {
            throw new IllegalArgumentException("New password must be different from the current password.");
        }

        person.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        Person saved = personRepository.save(person);

        return convertToDto(saved);
    }

    /**
     * Delete.
     *
     * @param id the id
     */
// Delete Person
    public void delete(Long id) {
        Person person = personRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Person with id " + id + " not found"));
        personRepository.delete(person);
    }

    /**
     * Convert to dto person dto.
     *
     * @param person the person
     * @return the person dto
     */
// Convert to DTO
    public PersonDto convertToDto(Person person) {
        return new PersonDto(
                String.valueOf(person.getPersonId()),
                person.getFullName(),
                String.valueOf(person.getRole()),
                person.getUsername()
        );
    }

    /**
     * Convert to entity person.
     *
     * @param createPersonDto the create person dto
     * @return the person
     */
    public Person convertToEntity(CreatePersonDto createPersonDto) {
        return new Person(
                null,
                createPersonDto.getFullName(),
                Role.valueOf(createPersonDto.getRole()),
                createPersonDto.getUsername(),
                createPersonDto.getPassword()
        );
    }
}
