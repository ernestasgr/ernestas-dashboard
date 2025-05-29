package com.ernestas.auth.util;

import com.ernestas.auth.model.User;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenUtilTest {
    private JwtTokenUtil jwtTokenUtil;
    private User user;

    @BeforeEach
    void setUp() {
        jwtTokenUtil = new JwtTokenUtil();
        String secret = "my-very-secret-key-which-is-long-enough-for-hmac";
        ReflectionTestUtils.setField(jwtTokenUtil, "secret", secret);

        long accessTokenExpiration = 1000 * 60 * 15;
        ReflectionTestUtils.setField(jwtTokenUtil, "accessTokenExpiration", accessTokenExpiration);

        long refreshTokenExpiration = 1000 * 60 * 60 * 24 * 7;
        ReflectionTestUtils.setField(jwtTokenUtil, "refreshTokenExpiration", refreshTokenExpiration);
        jwtTokenUtil.init();
        user = new User();
        user.setEmail("test@example.com");
        user.setName("Test User");
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

