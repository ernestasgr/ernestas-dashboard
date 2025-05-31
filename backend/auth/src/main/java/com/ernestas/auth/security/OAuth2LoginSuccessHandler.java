package com.ernestas.auth.security;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.ernestas.auth.model.User;
import com.ernestas.auth.service.UserService;
import com.ernestas.auth.util.JwtTokenUtil;
import com.fasterxml.jackson.databind.ObjectMapper;

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
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Constructor for OAuth2LoginSuccessHandler.
     *
     * @param userService  the UserService instance for user management
     * @param jwtTokenUtil the JwtTokenUtil instance for JWT token generation
     */
    public OAuth2LoginSuccessHandler(
            UserService userService,
            JwtTokenUtil jwtTokenUtil) {
        this.userService = userService;
        this.jwtTokenUtil = jwtTokenUtil;
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

            // Return tokens in JSON response
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            Map<String, String> tokens = new HashMap<>();
            tokens.put("accessToken", accessToken);
            tokens.put("refreshToken", refreshToken);
            PrintWriter out = response.getWriter();
            objectMapper.writeValue(out, tokens);
            out.flush();
        } else {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Authentication failed.");
        }
    }
}
