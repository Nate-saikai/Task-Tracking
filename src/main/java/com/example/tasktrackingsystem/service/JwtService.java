package com.example.tasktrackingsystem.service;

import com.example.tasktrackingsystem.dto.PersonDto;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.jspecify.annotations.NonNull;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * The type Jwt service.
 */
@Service
public class JwtService {

    private final String SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

    /**
     * Generate token string.
     *
     * @param personDto the person dto
     * @return the string
     */
    public String generateToken(@NonNull PersonDto personDto) {
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("fullName", personDto.getFullName());
        extraClaims.put("username", personDto.getUsername());
        extraClaims.put("role", personDto.getRole());

        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(String.valueOf(personDto.getPersonId()))
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000L * 60 * 60))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Is token valid boolean.
     *
     * @param token the token
     * @return the boolean
     */
    public boolean isTokenValid(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return claims.getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Extract user id long.
     *
     * @param token the token
     * @return the long
     */
    public Long extractUserId(String token) {
        Claims claims = extractAllClaims(token);
        return Long.parseLong(claims.getSubject());
    }

    /**
     * Extract user details person dto.
     *
     * @param token the token
     * @return the person dto
     */
    public PersonDto extractUserDetails(String token) {
        Claims claims = extractAllClaims(token);

        PersonDto person = new PersonDto();
        person.setPersonId(claims.getSubject());

        person.setUsername(claims.get("username", String.class));
        person.setFullName(claims.get("fullName", String.class));
        person.setRole(claims.get("role", String.class));
        return person;
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}