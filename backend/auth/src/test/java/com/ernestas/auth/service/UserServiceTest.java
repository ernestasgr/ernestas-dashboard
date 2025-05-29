package com.ernestas.auth.service;

import com.ernestas.auth.model.User;
import com.ernestas.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private OAuth2User oAuth2User;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setUp() throws Exception {
        try (AutoCloseable _ = MockitoAnnotations.openMocks(this)) {

        }
    }

    @Test
    void registerOrUpdateUserNewUser() {
        when(oAuth2User.getAttribute("email")).thenReturn("test@example.com");
        when(oAuth2User.getAttribute("name")).thenReturn("Test User");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        User user = userService.registerOrUpdateUser(oAuth2User);

        assertEquals("test@example.com", user.getEmail());
        assertEquals("Test User", user.getName());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void registerOrUpdateUserExistingUser() {
        User existingUser = new User();
        existingUser.setEmail("existing@example.com");
        existingUser.setName("Old Name");
        when(oAuth2User.getAttribute("email")).thenReturn("existing@example.com");
        when(oAuth2User.getAttribute("name")).thenReturn("New Name");
        when(userRepository.findByEmail("existing@example.com")).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        User user = userService.registerOrUpdateUser(oAuth2User);

        assertEquals("existing@example.com", user.getEmail());
        assertEquals("New Name", user.getName());
        verify(userRepository).save(existingUser);
    }

    @Test
    void findUserByEmailUserFound() {
        User user = new User();
        user.setEmail("found@example.com");
        when(userRepository.findByEmail("found@example.com")).thenReturn(Optional.of(user));

        User result = userService.findUserByEmail("found@example.com");
        assertEquals("found@example.com", result.getEmail());
    }

    @Test
    void findUserByEmailUserNotFound() {
        when(userRepository.findByEmail("notfound@example.com")).thenReturn(Optional.empty());
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            userService.findUserByEmail("notfound@example.com")
        );
        assertEquals("User not found", exception.getMessage());
    }
}

