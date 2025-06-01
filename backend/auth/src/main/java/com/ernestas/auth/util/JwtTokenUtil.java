package com.ernestas.auth.util;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

import javax.crypto.SecretKey;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.ernestas.auth.model.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * Utility class for creating and validating JWT access and refresh tokens.
 */
@Component
@RequiredArgsConstructor
public class JwtTokenUtil {
    private static final Logger logger = LoggerFactory.getLogger(JwtTokenUtil.class);

    @Value("${jwt.secret}")
    private String secret;

    @Getter
    @Value("${jwt.access.expiration}")
    private long accessTokenExpiration;

    @Getter
    @Value("${jwt.refresh.expiration}")
    private long refreshTokenExpiration;

    private Key signingKey;

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
     * Generates a signed JWT refresh token for the given user.
     *
     * @param user The user for whom to generate the token.
     * @return A signed JWT refresh token string.
     */
    public String generateRefreshToken(User user) {
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("type", "refresh")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshTokenExpiration))
                .signWith(signingKey)
                .compact();
    }

    /**
     * Validates the given token against the expected type and user.
     *
     * @param token        The JWT to validate.
     * @param expectedType The expected token type: "access" or "refresh".
     * @return True if the token is valid and matches the user and type.
     */
    public boolean validateToken(String token, String expectedType) {
        try {
            Claims claims = parseClaims(token);
            String tokenType = (String) claims.get("type");
            Date expiration = claims.getExpiration();
            logger.info("Token expires at: {}", expiration);
            return tokenType.equals(expectedType);
        } catch (Exception e) {
            logger.warn("Failed to validate token: {}", e.getMessage());
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
}
