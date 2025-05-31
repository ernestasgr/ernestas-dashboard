package com.ernestas.auth.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import com.ernestas.auth.graphql.AuthError;
import com.ernestas.auth.graphql.AuthPayload;
import com.ernestas.auth.graphql.AuthResult;
import com.ernestas.auth.graphql.RefreshResult;
import com.ernestas.auth.model.User;
import com.ernestas.auth.service.UserService;
import com.ernestas.auth.util.JwtTokenUtil;

import io.jsonwebtoken.Claims;

/**
 * Controller for authentication-related endpoints.
 */
@Controller
public class AuthController {
    private final JwtTokenUtil jwtTokenUtil;
    private final UserService userService;
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    /**
     * Constructor for AuthController.
     *
     * @param jwtTokenUtil the JwtTokenUtil instance for JWT token operations
     */
    public AuthController(
            JwtTokenUtil jwtTokenUtil,
            UserService userService) {
        this.jwtTokenUtil = jwtTokenUtil;
        this.userService = userService;
    }

    @QueryMapping
    public AuthResult me(@Argument String accessToken) {
        if (!jwtTokenUtil.validateToken(accessToken, "access")) {
            return new AuthError("Invalid access token");
        }

        if (!"access".equals(jwtTokenUtil.getTokenType(accessToken))) {
            return new AuthError("Invalid token type");
        }

        Claims claims = jwtTokenUtil.parseClaims(accessToken);
        return new AuthPayload(claims.getSubject(), (String) claims.get("name"));
    }

    @MutationMapping
    public RefreshResult refresh(@Argument String refreshToken) {
        if (!jwtTokenUtil.validateToken(refreshToken, "refresh")
                || !"refresh".equals(jwtTokenUtil.getTokenType(refreshToken))) {
            return new RefreshResult(null, null, "Invalid refresh token");
        }

        String email = jwtTokenUtil.getUsernameFromToken(refreshToken);
        User user = userService.findUserByEmail(email);

        String newAccessToken = jwtTokenUtil.generateAccessToken(user);
        String newRefreshToken = jwtTokenUtil.generateRefreshToken(user);

        return new RefreshResult(newAccessToken, newRefreshToken, "Access token refreshed");
    }
}
