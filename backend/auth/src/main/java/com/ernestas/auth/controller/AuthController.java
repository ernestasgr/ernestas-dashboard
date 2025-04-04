package com.ernestas.auth.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for authentication-related endpoints.
 */
@RestController
public class AuthController {
    /**
     * Endpoint for authentication.
     *
     * @param authentication the authentication object containing user details
     * @return a greeting message with the authenticated user's name
     */
    @GetMapping("/auth")
    public String authenticate(Authentication authentication) {
        return "Hello, " + authentication.getName();
    }
}
