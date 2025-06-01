package com.ernestas.auth.security;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.ernestas.auth.model.User;
import com.ernestas.auth.service.UserService;
import com.ernestas.auth.util.CookieGenerator;
import com.ernestas.auth.util.JwtTokenUtil;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Custom success handler for OAuth2 login authentication.
 * This class handles the successful authentication of users via OAuth2.
 */
@SuppressWarnings("checkstyle:AbbreviationAsWordInName")
@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserService userService;
    private final JwtTokenUtil jwtTokenUtil;
    private final CookieGenerator cookieGenerator;
    private static final Logger logger = LoggerFactory.getLogger(OAuth2LoginSuccessHandler.class);

    /**
     * Constructor for OAuth2LoginSuccessHandler.
     *
     * @param userService  the UserService instance for user management
     * @param jwtTokenUtil the JwtTokenUtil instance for JWT token generation
     */
    public OAuth2LoginSuccessHandler(
            UserService userService,
            JwtTokenUtil jwtTokenUtil,
            CookieGenerator cookieGenerator) {
        this.userService = userService;
        this.jwtTokenUtil = jwtTokenUtil;
        this.cookieGenerator = cookieGenerator;
    }

    /**
     * Handles successful authentication by generating a JWT token and sending it in
     * the response body as JSON.
     *
     * @param request        the HTTP request
     * @param response       the HTTP response
     * @param authentication the authentication object containing user details
     * @throws IOException if an I/O error occurs
     */
    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException {
        if (authentication instanceof OAuth2AuthenticationToken oauthToken) {
            OAuth2User oauth2User = oauthToken.getPrincipal();
            User user = userService.registerOrUpdateUser(oauth2User);

            String accessToken = jwtTokenUtil.generateAccessToken(user);
            String refreshToken = jwtTokenUtil.generateRefreshToken(user);

            response.addCookie(cookieGenerator.createCookie(
                    "accessToken",
                    accessToken,
                    "/",
                    (int) jwtTokenUtil.getAccessTokenExpiration() / 1000));
            response.addCookie(cookieGenerator.createCookie(
                    "refreshToken",
                    refreshToken,
                    "/refresh/",
                    (int) jwtTokenUtil.getRefreshTokenExpiration() / 1000));

            String redirectUri = (String) request.getSession().getAttribute("redirectUri");
            logger.info("Redirect URI from session: {}", redirectUri);
            if (redirectUri != null) {
                response.sendRedirect(redirectUri);
            } else {
                response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Redirect URI is missing.");
            }
        } else {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Authentication failed.");
        }
    }
}
