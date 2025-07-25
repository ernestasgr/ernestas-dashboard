package com.ernestas.auth.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.ernestas.auth.graphql.dto.AuthPayload;
import com.ernestas.auth.graphql.dto.MessageResult;
import com.ernestas.auth.graphql.exception.InvalidAccessTokenException;
import com.ernestas.auth.graphql.exception.InvalidRefreshTokenException;
import com.ernestas.auth.model.User;
import com.ernestas.auth.service.RefreshTokenService;
import com.ernestas.auth.service.UserService;
import com.ernestas.auth.util.CookieGenerator;
import com.ernestas.auth.util.JwtTokenUtil;

import graphql.GraphQLContext;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.Cookie;

public class AuthControllerTest {
    private JwtTokenUtil jwtTokenUtil;
    private UserService userService;
    private RefreshTokenService refreshTokenService;
    private CookieGenerator cookieGenerator;
    private AuthController authController;

    @BeforeEach
    void setUp() {
        jwtTokenUtil = mock(JwtTokenUtil.class);
        userService = mock(UserService.class);
        refreshTokenService = mock(RefreshTokenService.class);
        cookieGenerator = mock(CookieGenerator.class);
        authController = new AuthController(jwtTokenUtil, userService, refreshTokenService, cookieGenerator, 1, 1);
    }

    @Test
    void testMe_ValidAccessToken_ReturnsAuthPayload() {
        String token = "valid.token";
        GraphQLContext context = GraphQLContext.newContext().build();
        context.put("accessToken", token);

        Claims claims = mock(Claims.class);
        when(jwtTokenUtil.validateToken(token, "access")).thenReturn(true);
        when(jwtTokenUtil.parseClaims(token)).thenReturn(claims);
        when(claims.getSubject()).thenReturn("user@example.com");
        when(claims.get("name")).thenReturn("John Doe");

        AuthPayload result = authController.me(context);
        assertEquals("user@example.com", result.email());
        assertEquals("John Doe", result.name());
    }

    @Test
    void testMe_InvalidToken_ThrowsException() {
        GraphQLContext context = GraphQLContext.newContext().build();
        context.put("accessToken", "invalid.token");

        when(jwtTokenUtil.validateToken("invalid.token", "access")).thenReturn(false);

        assertThrows(InvalidAccessTokenException.class, () -> authController.me(context));
    }

    @Test
    void testMe_MissingToken_ThrowsException() {
        GraphQLContext context = GraphQLContext.newContext().build();
        assertThrows(InvalidAccessTokenException.class, () -> authController.me(context));
    }

    @Test
    void testRefresh_ValidToken_ReturnsNewTokens() {
        String refreshToken = "valid.refresh.token";
        String email = "user@example.com";
        String newAccessToken = "new.access.token";
        String newRefreshToken = "new.refresh.token";

        GraphQLContext context = GraphQLContext.newContext().build();
        context.put("refreshToken", refreshToken);

        User user = new User();
        user.setEmail(email);

        when(jwtTokenUtil.validateToken(refreshToken, "refresh")).thenReturn(true);
        when(jwtTokenUtil.getUsernameFromToken(refreshToken)).thenReturn(email);
        when(userService.findUserByEmail(email)).thenReturn(user);
        when(jwtTokenUtil.generateAccessToken(user)).thenReturn(newAccessToken);
        when(jwtTokenUtil.generateRefreshToken(user)).thenReturn(newRefreshToken);

        Cookie accessCookie = new Cookie("accessToken", newAccessToken);
        Cookie refreshCookie = new Cookie("refreshToken", newRefreshToken);
        when(cookieGenerator.createCookie(eq("accessToken"), eq(newAccessToken), any(), anyInt()))
                .thenReturn(accessCookie);
        when(cookieGenerator.createCookie(eq("refreshToken"), eq(newRefreshToken), any(), anyInt()))
                .thenReturn(refreshCookie);

        MessageResult result = authController.refresh(context);

        assertEquals("Access token refreshed", result.message());
        assertEquals(newAccessToken, context.get("accessToken"));
        assertEquals(newRefreshToken, context.get("refreshToken"));
    }

    @Test
    void testRefresh_InvalidToken_ReturnsError() {
        GraphQLContext context = GraphQLContext.newContext().build();
        context.put("refreshToken", "invalid.token");

        when(jwtTokenUtil.validateToken("invalid.token", "refresh")).thenReturn(false);

        assertThrows(InvalidRefreshTokenException.class, () -> authController.refresh(context));
    }

    @Test
    void testRefresh_MissingToken_ReturnsError() {
        GraphQLContext context = GraphQLContext.newContext().build();
        assertThrows(InvalidRefreshTokenException.class, () -> authController.refresh(context));
    }

    @Test
    void testRefresh_ValidToken_RevokesOldToken() {
        String refreshToken = "valid.refresh.token";
        String tokenId = "token-id-123";
        String email = "user@example.com";
        String newAccessToken = "new.access.token";
        String newRefreshToken = "new.refresh.token";

        GraphQLContext context = GraphQLContext.newContext().build();
        context.put("refreshToken", refreshToken);

        User user = new User();
        user.setEmail(email);

        when(jwtTokenUtil.validateToken(refreshToken, "refresh")).thenReturn(true);
        when(jwtTokenUtil.getTokenId(refreshToken)).thenReturn(tokenId);
        when(jwtTokenUtil.getUsernameFromToken(refreshToken)).thenReturn(email);
        when(userService.findUserByEmail(email)).thenReturn(user);
        when(jwtTokenUtil.generateAccessToken(user)).thenReturn(newAccessToken);
        when(jwtTokenUtil.generateRefreshToken(user)).thenReturn(newRefreshToken);

        Cookie accessCookie = new Cookie("accessToken", newAccessToken);
        Cookie refreshCookie = new Cookie("refreshToken", newRefreshToken);
        when(cookieGenerator.createCookie(eq("accessToken"), eq(newAccessToken), any(), anyInt()))
                .thenReturn(accessCookie);
        when(cookieGenerator.createCookie(eq("refreshToken"), eq(newRefreshToken), any(), anyInt()))
                .thenReturn(refreshCookie);

        MessageResult result = authController.refresh(context);

        assertEquals("Access token refreshed", result.message());
        verify(refreshTokenService).revokeRefreshToken(tokenId);
    }

    @Test
    void testLogout_ValidAccessToken_RevokesAllTokens() {
        String accessToken = "valid.access.token";
        String email = "user@example.com";

        GraphQLContext context = GraphQLContext.newContext().build();
        context.put("accessToken", accessToken);

        User user = new User();
        user.setEmail(email);

        Claims claims = mock(Claims.class);
        when(jwtTokenUtil.validateToken(accessToken, "access")).thenReturn(true);
        when(jwtTokenUtil.parseClaims(accessToken)).thenReturn(claims);
        when(claims.getSubject()).thenReturn(email);
        when(userService.findUserByEmail(email)).thenReturn(user);

        MessageResult result = authController.logout(context);

        assertEquals("Successfully logged out", result.message());
        verify(refreshTokenService).revokeAllTokensForUser(user);
    }

    @Test
    void testLogout_InvalidAccessToken_ThrowsException() {
        GraphQLContext context = GraphQLContext.newContext().build();
        context.put("accessToken", "invalid.token");

        when(jwtTokenUtil.validateToken("invalid.token", "access")).thenReturn(false);

        assertThrows(InvalidAccessTokenException.class, () -> authController.logout(context));
    }

    @Test
    void testLogout_MissingAccessToken_ThrowsException() {
        GraphQLContext context = GraphQLContext.newContext().build();
        assertThrows(InvalidAccessTokenException.class, () -> authController.logout(context));
    }
}
