package com.ernestas.auth.controller;


import com.ernestas.auth.model.User;
import com.ernestas.auth.service.UserService;
import com.ernestas.auth.util.CookieGenerator;
import com.ernestas.auth.util.JwtTokenUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for authentication-related endpoints.
 */
@RestController
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
     * Endpoint to get user information.
     *
     * @param accessToken the access token from the request cookie
     * @return a map containing user information
     */
    @GetMapping("/me/")
    public Map<String, Object> getUserInfo(
            @CookieValue("accessToken") String accessToken,
            HttpServletResponse response
    ) throws IOException {
        logger.info("Getting user info...");

        if (!jwtTokenUtil.validateToken(accessToken, "access")) {
            logger.warn("Invalid access token");
            response.sendRedirect("/refresh/");
            return Map.of("message", "Invalid access token");
        }

        if (!jwtTokenUtil.getTokenType(accessToken).equals("access")) {
            logger.warn("Invalid token type");
            return Map.of("message", "Invalid token type");
        }

        Claims claims = jwtTokenUtil.parseClaims(accessToken);
        logger.info("User: {}", claims.getSubject());
        return Map.of(
                "email", claims.getSubject(),
                "name", claims.get("name"));
    }

    /**
     * Endpoint to refresh the authentication token.
     *
     * @return a map indicating the success of the token refresh
     */
    @GetMapping("/refresh/")
    public Map<String, Object> refresh(
            @CookieValue("refreshToken") String refreshToken,
            HttpServletResponse response
    ) {
        logger.info("Refreshing user info");

        if (!jwtTokenUtil.getTokenType(refreshToken).equals("refresh")) {
            logger.warn("Invalid token type");
            return Map.of("message", "Invalid token type");
        }

        String email = jwtTokenUtil.getUsernameFromToken(refreshToken);
        User user = userService.findUserByEmail(email);

        if (!jwtTokenUtil.validateToken(refreshToken, "refresh")) {
            logger.warn("Invalid refresh token");
            return Map.of("message", "Invalid refresh token");
        }

        String newAccessToken = jwtTokenUtil.generateAccessToken(user);

        response.addCookie(cookieGenerator.createCookie(
                "accessToken",
                newAccessToken,
                "/",
                (int) jwtTokenUtil.getAccessTokenExpiration()));

        String newRefreshToken = jwtTokenUtil.generateRefreshToken(user);

        response.addCookie(cookieGenerator.createCookie(
                "refreshToken",
                newRefreshToken,
                "/refresh/",
                (int) jwtTokenUtil.getRefreshTokenExpiration()));

        logger.info("New access token: {}", newAccessToken);

        return Map.of("message", "Access token refreshed");
    }
}
