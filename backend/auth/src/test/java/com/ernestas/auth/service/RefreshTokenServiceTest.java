package com.ernestas.auth.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.ernestas.auth.model.RefreshToken;
import com.ernestas.auth.model.User;
import com.ernestas.auth.repository.RefreshTokenRepository;

class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @InjectMocks
    private RefreshTokenService refreshTokenService;

    private User testUser;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        testUser = new User();
        testUser.setId(1);
        testUser.setEmail("test@example.com");
        testUser.setName("Test User");
    }

    @Test
    void generateTokenId_shouldReturnNonNullValue() {
        String tokenId = refreshTokenService.generateTokenId();
        assertNotNull(tokenId);
        assertFalse(tokenId.isEmpty());
    }

    @Test
    void generateTokenId_shouldReturnUniqueValues() {
        String tokenId1 = refreshTokenService.generateTokenId();
        String tokenId2 = refreshTokenService.generateTokenId();
        assertNotEquals(tokenId1, tokenId2);
    }

    @Test
    void storeRefreshToken_shouldSaveTokenSuccessfully() {
        String tokenId = "test-token-id";
        String tokenValue = "test-token-value";
        LocalDateTime expiresAt = LocalDateTime.now().plusDays(7);

        RefreshToken savedToken = new RefreshToken();
        savedToken.setId(1L);
        savedToken.setTokenId(tokenId);
        savedToken.setUser(testUser);

        when(refreshTokenRepository.findActiveTokensByUser(eq(testUser), any(LocalDateTime.class)))
                .thenReturn(Collections.emptyList());
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenReturn(savedToken);

        RefreshToken result = refreshTokenService.storeRefreshToken(tokenId, tokenValue, testUser, expiresAt);

        assertNotNull(result);
        assertEquals(tokenId, result.getTokenId());
        assertEquals(testUser, result.getUser());
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    void validateRefreshToken_withValidToken_shouldReturnToken() {
        String tokenId = "test-token-id";
        String tokenValue = "test-token-value";

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setTokenId(tokenId);
        refreshToken.setHashedToken("hashed-value");
        refreshToken.setUser(testUser);
        refreshToken.setExpiresAt(LocalDateTime.now().plusDays(1));
        refreshToken.setRevoked(false);

        when(refreshTokenRepository.findByTokenId(tokenId)).thenReturn(Optional.of(refreshToken));

        Optional<RefreshToken> result = refreshTokenService.validateRefreshToken(tokenId, tokenValue);

        assertTrue(result.isEmpty());
    }

    @Test
    void validateRefreshToken_withNonExistentToken_shouldReturnEmpty() {
        String tokenId = "non-existent-token";
        String tokenValue = "test-token-value";

        when(refreshTokenRepository.findByTokenId(tokenId)).thenReturn(Optional.empty());

        Optional<RefreshToken> result = refreshTokenService.validateRefreshToken(tokenId, tokenValue);

        assertTrue(result.isEmpty());
    }

    @Test
    void revokeRefreshToken_shouldRevokeToken() {
        String tokenId = "test-token-id";
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setTokenId(tokenId);
        refreshToken.setRevoked(false);

        when(refreshTokenRepository.findByTokenId(tokenId)).thenReturn(Optional.of(refreshToken));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenReturn(refreshToken);

        refreshTokenService.revokeRefreshToken(tokenId);

        assertTrue(refreshToken.isRevoked());
        assertNotNull(refreshToken.getRevokedAt());
        verify(refreshTokenRepository).save(refreshToken);
    }

    @Test
    void revokeAllTokensForUser_shouldRevokeAllUserTokens() {
        int expectedRevokedCount = 3;
        when(refreshTokenRepository.revokeAllTokensForUser(eq(testUser), any(LocalDateTime.class)))
                .thenReturn(expectedRevokedCount);

        refreshTokenService.revokeAllTokensForUser(testUser);

        verify(refreshTokenRepository).revokeAllTokensForUser(eq(testUser), any(LocalDateTime.class));
    }

    @Test
    void cleanupExpiredTokens_shouldDeleteExpiredTokens() {
        int expectedDeletedCount = 5;
        when(refreshTokenRepository.deleteExpiredTokens(any(LocalDateTime.class)))
                .thenReturn(expectedDeletedCount);

        int result = refreshTokenService.cleanupExpiredTokens();

        assertEquals(expectedDeletedCount, result);
        verify(refreshTokenRepository).deleteExpiredTokens(any(LocalDateTime.class));
    }
}
