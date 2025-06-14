package com.ernestas.auth.model;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class RefreshTokenTest {

    private RefreshToken refreshToken;
    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1);
        user.setEmail("test@example.com");
        user.setName("Test User");

        refreshToken = new RefreshToken();
        refreshToken.setId(1L);
        refreshToken.setTokenId("test-token-id");
        refreshToken.setHashedToken("hashed-token-value");
        refreshToken.setUser(user);
        refreshToken.setCreatedAt(LocalDateTime.now());
        refreshToken.setExpiresAt(LocalDateTime.now().plusDays(7));
        refreshToken.setRevoked(false);
    }

    @Test
    void testRefreshTokenCreation() {
        assertNotNull(refreshToken);
        assertEquals("test-token-id", refreshToken.getTokenId());
        assertEquals("hashed-token-value", refreshToken.getHashedToken());
        assertEquals(user, refreshToken.getUser());
        assertFalse(refreshToken.isRevoked());
        assertNull(refreshToken.getRevokedAt());
    }

    @Test
    void testIsValid_withValidToken_returnsTrue() {
        refreshToken.setExpiresAt(LocalDateTime.now().plusDays(1));
        refreshToken.setRevoked(false);

        assertTrue(refreshToken.isValid());
    }

    @Test
    void testIsValid_withExpiredToken_returnsFalse() {
        refreshToken.setExpiresAt(LocalDateTime.now().minusDays(1));
        refreshToken.setRevoked(false);

        assertFalse(refreshToken.isValid());
    }

    @Test
    void testIsValid_withRevokedToken_returnsFalse() {
        refreshToken.setExpiresAt(LocalDateTime.now().plusDays(1));
        refreshToken.setRevoked(true);

        assertFalse(refreshToken.isValid());
    }

    @Test
    void testRevoke_setsRevokedFields() {
        LocalDateTime beforeRevoke = LocalDateTime.now();

        refreshToken.revoke();

        assertTrue(refreshToken.isRevoked());
        assertNotNull(refreshToken.getRevokedAt());
        assertTrue(refreshToken.getRevokedAt().isAfter(beforeRevoke) ||
                refreshToken.getRevokedAt().isEqual(beforeRevoke));
    }
}
