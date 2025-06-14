package com.ernestas.auth.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

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

/**
 * Controller for authentication-related endpoints.
 */
@Controller
public class AuthController {
    private final JwtTokenUtil jwtTokenUtil;
    private final UserService userService;
    private final RefreshTokenService refreshTokenService;
    private final CookieGenerator cookieGenerator;
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private final int accessTokenExpiration;
    private final int refreshTokenExpiration;

    /**
     * Creates an AuthController with required utilities and token expiration
     * settings.
     *
     * @param jwtTokenUtil           JWT token utility for token operations
     * @param userService            service for user operations
     * @param refreshTokenService    service for refresh token rotation management
     * @param cookieGenerator        utility for creating HTTP cookies
     * @param accessTokenExpiration  expiration time for access tokens, in seconds
     * @param refreshTokenExpiration expiration time for refresh tokens, in seconds
     */
    public AuthController(
            JwtTokenUtil jwtTokenUtil,
            UserService userService,
            RefreshTokenService refreshTokenService,
            CookieGenerator cookieGenerator,
            @Value("${jwt.access.expiration}") int accessTokenExpiration,
            @Value("${jwt.refresh.expiration}") int refreshTokenExpiration) {
        this.jwtTokenUtil = jwtTokenUtil;
        this.userService = userService;
        this.refreshTokenService = refreshTokenService;
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

        logger.info("Authenticated user: {}", claims.getSubject());

        return new AuthPayload(claims.getSubject(), (String) claims.get("name"));
    }

    /**
     * Generates new access and refresh tokens using a valid refresh token from the
     * GraphQL context, implementing refresh token rotation.
     *
     * <p>
     * This method implements refresh token rotation by:
     * 1. Validating the current refresh token
     * 2. Immediately revoking the used refresh token
     * 3. Generating new access and refresh tokens
     * 4. Storing the new refresh token securely
     * </p>
     *
     * @param context the GraphQL context containing the refresh token
     * @return a RefreshResult indicating the outcome of the refresh operation
     * @throws InvalidRefreshTokenException if the refresh token is missing,
     *                                      invalid, or already used
     */
    @MutationMapping
    public MessageResult refresh(GraphQLContext context) {
        String refreshToken = context.get("refreshToken");

        if (refreshToken == null) {
            logger.warn("Refresh token missing in request");
            throw new InvalidRefreshTokenException("Refresh token is required");
        }

        if (!jwtTokenUtil.validateToken(refreshToken, "refresh")) {
            logger.warn("Invalid refresh token provided");
            throw new InvalidRefreshTokenException("Invalid or expired refresh token");
        }

        // Extract token ID and revoke the current token immediately (rotation)
        String tokenId = jwtTokenUtil.getTokenId(refreshToken);
        if (tokenId != null) {
            refreshTokenService.revokeRefreshToken(tokenId);
            logger.debug("Revoked refresh token: {}", tokenId);
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

        logger.info("Successfully refreshed tokens for user: {}", email);
        return new MessageResult("Access token refreshed");
    }

    /**
     * Revokes all refresh tokens for the authenticated user.
     * This is useful for logout functionality or security incidents.
     *
     * @param context the GraphQL context containing the access token
     * @return a RefreshResult indicating the outcome of the logout operation
     * @throws InvalidAccessTokenException if the access token is missing or invalid
     */
    @MutationMapping
    public MessageResult logout(GraphQLContext context) {
        Object tokenObj = context.get("accessToken");

        if (!(tokenObj instanceof String accessToken) || !jwtTokenUtil.validateToken(accessToken, "access")) {
            logger.error("Invalid or missing access token for logout");
            throw new InvalidAccessTokenException("Valid access token required for logout");
        }

        Claims claims = jwtTokenUtil.parseClaims(accessToken);
        String email = claims.getSubject();
        User user = userService.findUserByEmail(email);

        refreshTokenService.revokeAllTokensForUser(user);

        logger.info("Successfully logged out user: {}", email);
        return new MessageResult("Successfully logged out");
    }
}
