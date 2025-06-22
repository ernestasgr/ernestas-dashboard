package com.ernestas.auth.util;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.ernestas.auth.model.User;
import com.ernestas.auth.service.RefreshTokenService;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.Getter;

/**
 * Utility class for creating and validating JWT access and refresh tokens.
 */
@Component
public class JwtTokenUtil {
    private final String secret;

    @Getter
    private final long accessTokenExpiration;

    @Getter
    private final long refreshTokenExpiration;

    private Key signingKey;
    private final RefreshTokenService refreshTokenService;

    /**
     * Constructs a JwtTokenUtil with the specified secret and token expiration
     * durations.
     *
     * @param secret                 the secret key used for signing JWT tokens
     * @param accessTokenExpiration  the expiration duration (in milliseconds) for
     *                               access tokens
     * @param refreshTokenExpiration the expiration duration (in milliseconds) for
     *                               refresh tokens
     * @param refreshTokenService    the service for managing refresh token
     *                               persistence
     */
    public JwtTokenUtil(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access.expiration}") long accessTokenExpiration,
            @Value("${jwt.refresh.expiration}") long refreshTokenExpiration,
            RefreshTokenService refreshTokenService) {
        this.secret = secret;
        this.accessTokenExpiration = accessTokenExpiration;
        this.refreshTokenExpiration = refreshTokenExpiration;
        this.refreshTokenService = refreshTokenService;
    }

    /**
     * Initializes the signing key using the secret key from application properties.
     */
    @PostConstruct
    public void init() {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Generates a signed JWT access token for the given user.
     *
     * @param user The user for whom to generate the token.
     * @return A signed JWT access token string.
     */
    public String generateAccessToken(User user) {
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("type", "access")
                .claim("name", user.getName())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessTokenExpiration))
                .signWith(signingKey)
                .compact();
    }

    /**
     * Generates a signed JWT refresh token for the given user with token rotation
     * support.
     *
     * @param user The user for whom to generate the token.
     * @return A signed JWT refresh token string.
     */
    public String generateRefreshToken(User user) {
        String tokenId = refreshTokenService.generateTokenId();
        Date expirationDate = new Date(System.currentTimeMillis() + refreshTokenExpiration);

        String token = Jwts.builder()
                .subject(user.getEmail())
                .claim("type", "refresh")
                .claim("tokenId", tokenId)
                .issuedAt(new Date())
                .expiration(expirationDate)
                .signWith(signingKey)
                .compact();

        LocalDateTime expiresAt = expirationDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
        refreshTokenService.storeRefreshToken(tokenId, token, user, expiresAt);

        return token;
    }

    /**
     * Validates the given token against the expected type and checks database
     * persistence for refresh tokens.
     *
     * @param token        The JWT to validate.
     * @param expectedType The expected token type: "access" or "refresh".
     * @return True if the token is valid and matches the user and type.
     */
    public boolean validateToken(String token, String expectedType) {
        try {
            Claims claims = parseClaims(token);
            String tokenType = (String) claims.get("type");

            if (!tokenType.equals(expectedType)) {
                return false;
            }

            if ("refresh".equals(expectedType)) {
                String tokenId = (String) claims.get("tokenId");
                if (tokenId == null) {
                    return false;
                }

                return refreshTokenService.validateRefreshToken(tokenId, token).isPresent();
            }

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Parses and returns the claims of a JWT.
     *
     * @param token The JWT to parse.
     * @return The claims contained in the token.
     */
    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith((SecretKey) this.signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Extracts the "type" claim from the token (either "access" or "refresh").
     *
     * @param token The JWT.
     * @return The token type.
     */
    public String getTokenType(String token) {
        return (String) parseClaims(token).get("type");
    }

    /**
     * Extracts the subject (typically the user email) from the token.
     *
     * @param token The JWT.
     * @return The subject (email).
     */
    public String getUsernameFromToken(String token) {
        return parseClaims(token).getSubject();
    }

    /**
     * Extracts the token ID from a refresh token.
     *
     * @param token The JWT refresh token.
     * @return The token ID if present, null otherwise.
     */
    public String getTokenId(String token) {
        try {
            Claims claims = parseClaims(token);
            return (String) claims.get("tokenId");
        } catch (Exception e) {
            return null;
        }
    }
}
