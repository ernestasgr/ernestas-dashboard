package com.ernestas.auth.service;

import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ernestas.auth.model.User;
import com.ernestas.auth.repository.UserRepository;

/**
 * Service class for managing user registration and updates.
 */
@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final RefreshTokenService refreshTokenService;

    /**
     * Constructor for UserService.
     *
     * @param userRepository      the UserRepository instance for database
     *                            operations
     * @param refreshTokenService the RefreshTokenService for managing refresh
     *                            tokens
     */
    public UserService(UserRepository userRepository, RefreshTokenService refreshTokenService) {
        this.userRepository = userRepository;
        this.refreshTokenService = refreshTokenService;
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
    @Transactional(readOnly = true)
    public User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * Revokes all refresh tokens for a user. This is useful for security purposes
     * such as when a user changes their password or reports a security incident.
     *
     * @param user the user whose tokens should be revoked
     */
    public void revokeAllUserTokens(User user) {
        refreshTokenService.revokeAllTokensForUser(user);
    }

    /**
     * Revokes all refresh tokens for a user by email.
     *
     * @param email the email of the user whose tokens should be revoked
     */
    public void revokeAllUserTokens(String email) {
        User user = findUserByEmail(email);
        revokeAllUserTokens(user);
    }
}
