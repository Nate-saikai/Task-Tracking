package com.example.tasktrackingsystem.service;

import com.example.tasktrackingsystem.dto.*;
import com.example.tasktrackingsystem.dto.CreatePersonDto;
import com.example.tasktrackingsystem.dto.PersonDto;
import com.example.tasktrackingsystem.exceptions.InvalidInputException;
import com.example.tasktrackingsystem.exceptions.PersonNotFoundException;
import com.example.tasktrackingsystem.model.Person;
import com.example.tasktrackingsystem.model.Role;
import com.example.tasktrackingsystem.repository.PersonRepository;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.domain.Page;
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
                .orElseThrow(() -> new PersonNotFoundException("Person with id " + id + " not found"));
    }

    /**
     * Find all list.
     *
     * @return the list
     */
// Get All Person
    public List<PersonDto> findAll() {

        List<PersonDto> list = personRepository.findAll().stream().map(this::convertToDto).toList();

        if (list.isEmpty()) throw new PersonNotFoundException("No users found");

        return list;
    }

    /**
     * Find all paginated list.
     *
     * @param pageable the pageable
     * @return the list
     */
// Get All Person Paginated
    public Page<PersonDto> findAllPaginated(Pageable pageable) {
        return personRepository.findAll(pageable).map(this::convertToDto);
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
            throw new DuplicateKeyException("Username is already taken.");
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
                .orElseThrow(() -> new PersonNotFoundException("Person with id " + id + " not found"));

        boolean changed = false;

        if (dto.getFullName() != null) {
            String name = dto.getFullName().trim();
            if (name.isEmpty()) {
                throw new InvalidInputException("Full name must not be blank.");
            }
            person.setFullName(name);
            changed = true;
        }

        if (dto.getUsername() != null) {
            String uname = dto.getUsername().trim();
            if (uname.isEmpty()) {
                throw new InvalidInputException("Username must not be blank.");
            }

            if (!uname.equals(person.getUsername())
                    && personRepository.existsByUsernameAndPersonIdNot(uname, id)) {
                throw new DuplicateKeyException("Username is already taken.");
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
                .orElseThrow(() -> new PersonNotFoundException("Person with id " + id + " not found"));

        if (!passwordEncoder.matches(dto.getCurrentPassword(), person.getPassword())) {
            throw new BadCredentialsException("Current password is incorrect.");
        }

        if (passwordEncoder.matches(dto.getNewPassword(), person.getPassword())) {
            throw new InvalidInputException("New password must be different from the current password.");
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
                .orElseThrow(() -> new PersonNotFoundException("Person with id " + id + " not found"));
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
                person.getPersonId(),
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
