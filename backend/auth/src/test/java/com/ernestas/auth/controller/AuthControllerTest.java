package com.ernestas.auth.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.ernestas.auth.graphql.dto.AuthPayload;
import com.ernestas.auth.graphql.dto.RefreshResult;
import com.ernestas.auth.graphql.exception.InvalidAccessTokenException;
import com.ernestas.auth.model.User;
import com.ernestas.auth.service.UserService;
import com.ernestas.auth.util.CookieGenerator;
import com.ernestas.auth.util.JwtTokenUtil;

import graphql.GraphQLContext;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.Cookie;

public class AuthControllerTest {

    private JwtTokenUtil jwtTokenUtil;
    private UserService userService;
    private CookieGenerator cookieGenerator;
    private AuthController authController;

    @BeforeEach
    void setUp() {
        jwtTokenUtil = mock(JwtTokenUtil.class);
        userService = mock(UserService.class);
        cookieGenerator = mock(CookieGenerator.class);
        authController = new AuthController(jwtTokenUtil, userService, cookieGenerator);
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

        RefreshResult result = authController.refresh(context);

        assertEquals("Access token refreshed", result.message());
        assertEquals(newAccessToken, context.get("accessToken"));
        assertEquals(newRefreshToken, context.get("refreshToken"));
    }

    @Test
    void testRefresh_InvalidToken_ReturnsError() {
        GraphQLContext context = GraphQLContext.newContext().build();
        context.put("refreshToken", "invalid.token");

        when(jwtTokenUtil.validateToken("invalid.token", "refresh")).thenReturn(false);

        RefreshResult result = authController.refresh(context);
        assertEquals("Invalid refresh token", result.message());
    }

    @Test
    void testRefresh_MissingToken_ReturnsError() {
        GraphQLContext context = GraphQLContext.newContext().build();

        RefreshResult result = authController.refresh(context);
        assertEquals("Invalid refresh token", result.message());
    }
}
