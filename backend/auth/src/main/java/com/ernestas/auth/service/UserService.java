package com.ernestas.auth.service;

import com.ernestas.auth.model.User;
import com.ernestas.auth.repository.UserRepository;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

/**
 * Service class for managing user registration and updates.
 */
@Service
public class UserService {

    private final UserRepository userRepository;

    /**
     * Constructor for UserService.
     *
     * @param userRepository the UserRepository instance for database operations
     */
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Registers a new user or updates an existing user
     * based on the provided OAuth2User information.
     *
     * @param oauth2User the OAuth2User object containing user information
     * @return the registered or updated User entity
     */
    public User registerOrUpdateUser(OAuth2User oauth2User) {
        String email = oauth2User.getAttribute("email");
        User user = userRepository
            .findByEmail(email)
            .orElse(new User());
        user.setEmail(email);
        user.setName(oauth2User.getAttribute("name"));

        return userRepository.save(user);
    }

    /**
     * Finds a user by their email address.
     *
     * @param email the email address of the user
     * @return the User entity if found
     * @throws RuntimeException if the user is not found
     */
    public User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
