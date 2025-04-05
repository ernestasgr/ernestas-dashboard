package com.ernestas.auth.controller;

import java.util.Map;
import java.util.Objects;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for authentication-related endpoints.
 */
@RestController
public class AuthController {
    /**
     * Endpoint to retrieve user information.
     *
     * @param principal the authenticated user's OAuth2User object
     * @return a map containing user information
     */
    @GetMapping("/me")
    public Map<String, Object> getUserInfo(@AuthenticationPrincipal OAuth2User principal) {
        return Map.of(
            "name", Objects.requireNonNull(principal.getAttribute("name")),
            "email", Objects.requireNonNull(principal.getAttribute("email")),
            "picture", Objects.requireNonNull(principal.getAttribute("picture"))
        );
    }
}
