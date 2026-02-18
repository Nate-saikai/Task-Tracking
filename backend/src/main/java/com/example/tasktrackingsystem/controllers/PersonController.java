package com.example.tasktrackingsystem.controllers;

import com.example.tasktrackingsystem.dto.*;
import com.example.tasktrackingsystem.service.PersonService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * The type Person controller.
 */
@RestController
@RequestMapping("${api.path.person}")
public class PersonController {

    private final PersonService personService;

    @Value("${page.size}")
    private int PAGE_SIZE;

    /**
     * Instantiates a new Person controller.
     *
     * @param personService the person service
     */
    public PersonController(PersonService personService) {
        this.personService = personService;
    }

    /**
     * Find by id response entity.
     *
     * @param id the id
     * @return the response entity
     */
// Get by id
    @GetMapping("/{id}")
    public ResponseEntity<PersonDto> findById(@PathVariable Long id) {
        return new ResponseEntity<>(personService.findById(id), HttpStatus.OK);
    }

    /**
     * Find all response entity.
     *
     * @return the response entity
     */
// Get All
    @GetMapping("/all")
    public ResponseEntity<List<PersonDto>> findAll() {
        return new ResponseEntity<>(personService.findAll(), HttpStatus.OK);
    }

    /**
     * Find all paginated response entity.
     *
     * @param pageNumber the page number
     * @return the response entity
     */
// Get All Paginated
    @GetMapping("/paginated/{pageNumber}")
    public ResponseEntity<List<PersonDto>> findAllPaginated(@PathVariable int pageNumber) {
        Pageable pageable = PageRequest.of(pageNumber, PAGE_SIZE);
        return new ResponseEntity<>(personService.findAllPaginated(pageable), HttpStatus.OK);
    }

    /**
     * Login response entity.
     *
     * @param loginPersonDto the login person dto
     * @return the response entity
     */
// Login
    @PostMapping("/login")
    public ResponseEntity<PersonDto> login(@RequestBody @Valid LoginPersonDto loginPersonDto) {
        return new ResponseEntity<>(
                personService.login(loginPersonDto.getUsername(), loginPersonDto.getPassword()),
                HttpStatus.OK
        );
    }

    /**
     * Create admin response entity.
     *
     * @param createPersonDto the createPerson dto
     * @return the response entity
     */
// Create
    @PostMapping("/add-admin")
    public ResponseEntity<PersonDto> createAdmin(@RequestBody @Valid CreatePersonDto createPersonDto) {
        createPersonDto.setRole("ADMIN");
        return new ResponseEntity<>(personService.create(createPersonDto), HttpStatus.OK);
    }

    /**
     * Create user response entity.
     *
     * @param createPersonDto the createPerson dto
     * @return the response entity
     */
    @PostMapping("/register-user")
    public ResponseEntity<PersonDto> createUser(@RequestBody @Valid CreatePersonDto createPersonDto) {
        createPersonDto.setRole("USER");
        return new ResponseEntity<>(personService.create(createPersonDto), HttpStatus.OK);
    }

    /**
     * Patch profile response entity.
     *
     * @param id  the id
     * @param dto the dto
     * @return the response entity
     */
    @PatchMapping("/{id}/profile")
    public ResponseEntity<PersonDto> patchProfile(@PathVariable Long id, @RequestBody @Valid PatchPersonProfileDto dto) {
        return new ResponseEntity<>(personService.patchProfile(id, dto), HttpStatus.OK);
    }

    /**
     * Change password response entity.
     *
     * @param id  the id
     * @param dto the dto
     * @return the response entity
     */
    @PutMapping("/{id}/password")
    public ResponseEntity<PersonDto> changePassword(@PathVariable Long id, @RequestBody @Valid ChangePasswordDto dto) {
        return new ResponseEntity<>(personService.changePassword(id, dto), HttpStatus.OK);
    }

    /**
     * Delete user response entity.
     *
     * @param id the id
     * @return the response entity
     */
// Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        personService.delete(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
