package com.ernestas.auth.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import com.ernestas.auth.graphql.dto.AuthPayload;
import com.ernestas.auth.graphql.dto.RefreshResult;
import com.ernestas.auth.graphql.exception.InvalidAccessTokenException;
import com.ernestas.auth.graphql.exception.InvalidRefreshTokenException;
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
    private final int accessTokenExpiration;
    private final int refreshTokenExpiration;

    /**
     * Creates an AuthController with required utilities and token expiration
     * settings.
     *
     * @param accessTokenExpiration  expiration time for access tokens, in seconds
     * @param refreshTokenExpiration expiration time for refresh tokens, in seconds
     */
    public AuthController(
            JwtTokenUtil jwtTokenUtil,
            UserService userService,
            CookieGenerator cookieGenerator,
            @Value("${jwt.access.expiration}") int accessTokenExpiration,
            @Value("${jwt.refresh.expiration}") int refreshTokenExpiration) {
        this.jwtTokenUtil = jwtTokenUtil;
        this.userService = userService;
        this.cookieGenerator = cookieGenerator;
        this.accessTokenExpiration = accessTokenExpiration;
        this.refreshTokenExpiration = refreshTokenExpiration;
    }

    /****
     * Retrieves the authenticated user's email and name from a valid access token
     * in the GraphQL context.
     *
     * @param context the GraphQL context containing the access token
     * @return an AuthPayload with the user's email and name
     * @throws InvalidAccessTokenException if the access token is missing or invalid
     */
    @QueryMapping
    public AuthPayload me(GraphQLContext context) {
        Object tokenObj = context.get("accessToken");

        if (!(tokenObj instanceof String accessToken) || !jwtTokenUtil.validateToken(accessToken, "access")) {
            logger.error("Invalid or missing access token");
            throw new InvalidAccessTokenException("Invalid access token");
        }

        Claims claims = jwtTokenUtil.parseClaims(accessToken);
        return new AuthPayload(claims.getSubject(), (String) claims.get("name"));
    }

    /**
     * Generates new access and refresh tokens using a valid refresh token from the
     * GraphQL context.
     *
     * <p>
     * If the refresh token is missing or invalid, returns a result indicating an
     * error.
     * On success, issues new tokens, updates the context with their values,
     * and returns a result indicating the access token was refreshed.
     * </p>
     *
     * @param context the GraphQL context containing the refresh token
     * @return a RefreshResult indicating the outcome of the refresh operation
     */
    @MutationMapping
    public RefreshResult refresh(GraphQLContext context) {
        String refreshToken = context.get("refreshToken");

        if (refreshToken == null || !jwtTokenUtil.validateToken(refreshToken, "refresh")) {
            throw new InvalidRefreshTokenException("Invalid refresh token");
        }

        String email = jwtTokenUtil.getUsernameFromToken(refreshToken);
        User user = userService.findUserByEmail(email);

        String newAccessToken = jwtTokenUtil.generateAccessToken(user);
        String newRefreshToken = jwtTokenUtil.generateRefreshToken(user);

        Cookie accessCookie = cookieGenerator.createCookie("accessToken", newAccessToken, "/",
                accessTokenExpiration);
        Cookie refreshCookie = cookieGenerator.createCookie("refreshToken", newRefreshToken, "/",
                refreshTokenExpiration);

        context.put("accessToken", accessCookie.getValue());
        context.put("refreshToken", refreshCookie.getValue());

        return new RefreshResult("Access token refreshed");
    }

}
