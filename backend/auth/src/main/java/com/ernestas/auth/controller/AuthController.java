package com.ernestas.auth.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

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

/**
 * Controller for authentication-related endpoints.
 */
@Controller
public class AuthController {
    private final JwtTokenUtil jwtTokenUtil;
    private final UserService userService;
    private final CookieGenerator cookieGenerator;
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    /**
     * Constructor for AuthController.
     *
     * @param jwtTokenUtil the JwtTokenUtil instance for JWT token operations
     */
    public AuthController(
            JwtTokenUtil jwtTokenUtil,
            UserService userService,
            CookieGenerator cookieGenerator) {
        this.jwtTokenUtil = jwtTokenUtil;
        this.userService = userService;
        this.cookieGenerator = cookieGenerator;
    }

    /**
     * Endpoint to get the authenticated user's information.
     *
     * @param context the GraphQL context containing the access token
     * @return AuthPayload containing user email and name
     * @throws InvalidAccessTokenException if the access token is invalid or missing
     */
    @QueryMapping
    public AuthPayload me(GraphQLContext context) {
        String accessToken = context.get("accessToken");
        logger.info("Received access token from cookie: {}", accessToken);

        if (accessToken == null || !jwtTokenUtil.validateToken(accessToken, "access")) {
            logger.error("Invalid or missing access token: {}", accessToken);
            throw new InvalidAccessTokenException("Invalid access token");
        }

        Claims claims = jwtTokenUtil.parseClaims(accessToken);
        return new AuthPayload(claims.getSubject(), (String) claims.get("name"));
    }

    /**
     * Endpoint to refresh the access token using the refresh token.
     *
     * @param context the GraphQL context containing the refresh token
     * @return RefreshResult containing new access and refresh tokens
     */
    @MutationMapping
    public RefreshResult refresh(GraphQLContext context) {
        String refreshToken = context.get("refreshToken");
        logger.info("Received refresh token from cookie: {}", refreshToken);

        if (refreshToken == null || !jwtTokenUtil.validateToken(refreshToken, "refresh")) {
            return new RefreshResult("Invalid refresh token");
        }

        String email = jwtTokenUtil.getUsernameFromToken(refreshToken);
        User user = userService.findUserByEmail(email);

        String newAccessToken = jwtTokenUtil.generateAccessToken(user);
        String newRefreshToken = jwtTokenUtil.generateRefreshToken(user);

        Cookie accessCookie = cookieGenerator.createCookie("accessToken", newAccessToken, "/",
                10);
        Cookie refreshCookie = cookieGenerator.createCookie("refreshToken", newRefreshToken, "/",
                30);

        context.put("accessToken", accessCookie.getValue());
        context.put("refreshToken", refreshCookie.getValue());

        return new RefreshResult("Access token refreshed");
    }
}
