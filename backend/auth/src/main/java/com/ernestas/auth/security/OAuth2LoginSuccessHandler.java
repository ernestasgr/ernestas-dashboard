package com.ernestas.auth.security;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.ernestas.auth.model.User;
import com.ernestas.auth.service.GitHubOAuth2UserService;
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
    private final GitHubOAuth2UserService gitHubOAuth2UserService;
    private final OAuth2AuthorizedClientService authorizedClientService;

    @Value("${frontend.domain}")
    private String frontendDomain;

    private static final Logger logger = LoggerFactory.getLogger(OAuth2LoginSuccessHandler.class);

    /****
     * Creates an instance of OAuth2LoginSuccessHandler with required dependencies.
     *
     * @param userService             service for registering or updating users
     *                                after OAuth2
     *                                login
     * @param jwtTokenUtil            utility for generating JWT access and refresh
     *                                tokens
     * @param cookieGenerator         utility for creating HTTP cookies for tokens
     * @param gitHubOAuth2UserService service for handling GitHub-specific OAuth2
     *                                user data
     * @param authorizedClientService service for managing OAuth2 authorized clients
     */
    public OAuth2LoginSuccessHandler(
            UserService userService,
            JwtTokenUtil jwtTokenUtil,
            CookieGenerator cookieGenerator,
            GitHubOAuth2UserService gitHubOAuth2UserService,
            OAuth2AuthorizedClientService authorizedClientService) {
        this.userService = userService;
        this.jwtTokenUtil = jwtTokenUtil;
        this.cookieGenerator = cookieGenerator;
        this.gitHubOAuth2UserService = gitHubOAuth2UserService;
        this.authorizedClientService = authorizedClientService;
    }

    /****
     * Handles successful OAuth2 authentication by registering or updating the user,
     * generating JWT access and refresh tokens, setting them as cookies, and
     * redirecting the user.
     *
     * <p>
     * If a redirect URI is present in the session, the user is redirected to that
     * URI.
     * Otherwise, a 400 Bad Request error is sent. If authentication is not an
     * OAuth2 token,
     * a 401 Unauthorized error is returned.
     * </p>
     *
     * @param request        the HTTP request
     * @param response       the HTTP response
     * @param authentication the authentication object
     * @throws IOException if an I/O error occurs during response handling
     */
    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException {
        if (authentication instanceof OAuth2AuthenticationToken oauthToken) {
            OAuth2User oauth2User = oauthToken.getPrincipal();
            String registrationId = oauthToken.getAuthorizedClientRegistrationId();

            // Handle GitHub authentication specifically, because email is not included
            // in the standard OAuth2 user attributes
            if ("github".equals(registrationId)) {
                try {
                    OAuth2AuthorizedClient authorizedClient = authorizedClientService
                            .loadAuthorizedClient(registrationId, oauthToken.getName());

                    if (authorizedClient != null) {
                        OAuth2AccessToken accessToken = authorizedClient.getAccessToken();
                        if (accessToken != null) {
                            // Enhance GitHub user with email information
                            oauth2User = gitHubOAuth2UserService.enhanceGitHubUser(oauth2User,
                                    accessToken.getTokenValue());
                        } else {
                            logger.error("No access token found for GitHub user");
                            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                                    "Failed to retrieve GitHub access token");
                            return;
                        }
                    } else {
                        logger.error("No authorized client found for GitHub user");
                        response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                                "Failed to retrieve GitHub client information");
                        return;
                    }
                } catch (Exception e) {
                    logger.error("Error enhancing GitHub user information", e);
                    response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                            "Failed to retrieve GitHub user information");
                    return;
                }
            }

            User user = userService.registerOrUpdateUser(oauth2User);

            String accessToken = jwtTokenUtil.generateAccessToken(user);
            String refreshToken = jwtTokenUtil.generateRefreshToken(user);

            response.addCookie(cookieGenerator.createCookie(
                    "accessToken",
                    accessToken,
                    "/",
                    (int) (jwtTokenUtil.getAccessTokenExpiration() / 1000)));
            response.addCookie(cookieGenerator.createCookie(
                    "refreshToken",
                    refreshToken,
                    "/",
                    (int) (jwtTokenUtil.getRefreshTokenExpiration() / 1000)));

            String redirectUri = (String) request.getSession().getAttribute("redirectUri");
            frontendDomain = frontendDomain != null ? frontendDomain : "";
            logger.info("Frontend domain: {}", frontendDomain);
            if (redirectUri != null && frontendDomain != null && redirectUri.startsWith(frontendDomain)) {
                logger.info("Redirecting to: {}", redirectUri);
                response.sendRedirect(redirectUri);
            } else if (redirectUri == null) {
                logger.error("Redirect URI is missing in session.");
                response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Redirect URI is missing.");
            } else {
                logger.error("Invalid redirect URI: {}", redirectUri);
                response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid redirect URI.");
            }
        } else {
            logger.error("Authentication failed.");
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Authentication failed.");
        }
    }
}
