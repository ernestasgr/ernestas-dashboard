package com.ernestas.auth.util;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.ernestas.auth.model.RefreshToken;
import com.ernestas.auth.model.User;
import com.ernestas.auth.service.RefreshTokenService;

import io.jsonwebtoken.Claims;

class JwtTokenUtilTest {
    private JwtTokenUtil jwtTokenUtil;
    private User user;
    private RefreshTokenService refreshTokenService;

    @BeforeEach
    void setUp() {
        refreshTokenService = mock(RefreshTokenService.class);
        jwtTokenUtil = new JwtTokenUtil("my-very-secret-key-which-is-long-enough-for-hmac", 1000 * 60 * 15,
                1000 * 60 * 60 * 24 * 7, refreshTokenService);
        jwtTokenUtil.init();
        user = new User();
        user.setEmail("test@example.com");
        user.setName("Test User");

        when(refreshTokenService.generateTokenId()).thenReturn("test-token-id");
        when(refreshTokenService.storeRefreshToken(anyString(), anyString(), any(User.class), any()))
                .thenReturn(new RefreshToken());
    }

    @Test
    void testGenerateAndValidateAccessToken() {
        String token = jwtTokenUtil.generateAccessToken(user);
        assertNotNull(token);
        assertTrue(jwtTokenUtil.validateToken(token, "access"));
        assertEquals("access", jwtTokenUtil.getTokenType(token));
        assertEquals(user.getEmail(), jwtTokenUtil.getUsernameFromToken(token));
    }

    @Test
    void testGenerateAndValidateRefreshToken() {
        RefreshToken refreshToken = new RefreshToken();
        when(refreshTokenService.validateRefreshToken(eq("test-token-id"), anyString()))
                .thenReturn(Optional.of(refreshToken));

        String token = jwtTokenUtil.generateRefreshToken(user);
        assertNotNull(token);
        assertTrue(jwtTokenUtil.validateToken(token, "refresh"));
        assertEquals("refresh", jwtTokenUtil.getTokenType(token));
        assertEquals(user.getEmail(), jwtTokenUtil.getUsernameFromToken(token));
    }

    @Test
    void testValidateTokenWithWrongType() {
        String token = jwtTokenUtil.generateAccessToken(user);
        assertFalse(jwtTokenUtil.validateToken(token, "refresh"));
    }

    @Test
    void testParseClaims() {
        String token = jwtTokenUtil.generateAccessToken(user);
        Claims claims = jwtTokenUtil.parseClaims(token);
        assertEquals(user.getEmail(), claims.getSubject());
        assertEquals("access", claims.get("type"));
        assertEquals(user.getName(), claims.get("name"));
    }

    @Test
    void testValidateInvalidToken() {
        assertFalse(jwtTokenUtil.validateToken("invalid.token.value", "access"));
    }
}
