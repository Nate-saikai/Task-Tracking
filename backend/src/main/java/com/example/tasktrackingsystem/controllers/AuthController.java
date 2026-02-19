package com.example.tasktrackingsystem.controllers;

import com.example.tasktrackingsystem.dto.CreatePersonDto;
import com.example.tasktrackingsystem.dto.LoginPersonDto;
import com.example.tasktrackingsystem.dto.PersonDto;
import com.example.tasktrackingsystem.service.JwtService;
import com.example.tasktrackingsystem.service.PersonService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

/**
 * The type Auth controller.
 */
@RestController
@RequestMapping("${api.path.auth}")
public class AuthController {
    private final PersonService personService;
    private final JwtService jwtService;

    /**
     * Instantiates a new Auth controller.
     *
     * @param personService the person service
     * @param jwtService    the jwt service
     */
    public AuthController(PersonService personService, JwtService jwtService) {
        this.personService = personService;
        this.jwtService = jwtService;
    }

    /**
     * Register response entity.
     *
     * @param createPersonDto the createPerson dto
     * @param response        the response
     * @return the response entity
     */
// Register User
    @PostMapping("/register")
    public ResponseEntity<PersonDto> register(@Valid @RequestBody CreatePersonDto createPersonDto, HttpServletResponse response) {
        createPersonDto.setRole("USER");
        PersonDto newUser = personService.create(createPersonDto);
        setJwtCookie(response, newUser, 24 * 60 * 60);
        return new ResponseEntity<>(newUser, HttpStatus.OK);
    }

    /**
     * Login response entity.
     *
     * @param loginPersonDto the login person dto
     * @param response       the response
     * @return the response entity
     */
// Login User
    @PostMapping("/login")
    public ResponseEntity<PersonDto> login(@Valid @RequestBody LoginPersonDto loginPersonDto, HttpServletResponse response) {
        PersonDto toBeLoggedInPerson = personService.login(loginPersonDto.getUsername(), loginPersonDto.getPassword());
        if (!(toBeLoggedInPerson.getPersonId() == null)) {
            setJwtCookie(response, toBeLoggedInPerson, 24 * 60 * 60);
            return new ResponseEntity<>(toBeLoggedInPerson, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }

    /**
     * Logout person response entity.
     *
     * @param response the response
     * @return the response entity
     */
// Logout
    @PostMapping("/logout")
    public ResponseEntity<?> logoutPerson(HttpServletResponse response) {
        setJwtCookie(response, null, 0);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    /**
     * Me response entity.
     *
     * @param token the token
     * @return the response entity
     */
    @GetMapping("/me")
    public ResponseEntity<PersonDto> me(@CookieValue(name = "token", required = false) String token) {
        if (token == null || token.isBlank()) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        if (!jwtService.isTokenValid(token)) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        Long userId;
        try {
            userId = jwtService.extractUserId(token);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        PersonDto person = personService.findById(userId);

        if (person == null || person.getPersonId() == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        return new ResponseEntity<>(person, HttpStatus.OK);
    }

    private void setJwtCookie(HttpServletResponse response, PersonDto personDto, long maxAge) {
        String token = (personDto != null) ? jwtService.generateToken(personDto) : "";

        ResponseCookie cookie = ResponseCookie.from("token", token)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(maxAge)
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
