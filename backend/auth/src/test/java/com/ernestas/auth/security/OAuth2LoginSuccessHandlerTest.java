package com.ernestas.auth.security;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;

import com.ernestas.auth.model.User;
import com.ernestas.auth.service.GitHubOAuth2UserService;
import com.ernestas.auth.service.UserService;
import com.ernestas.auth.util.CookieGenerator;
import com.ernestas.auth.util.JwtTokenUtil;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

class OAuth2LoginSuccessHandlerTest {

    private UserService userService;
    private JwtTokenUtil jwtTokenUtil;
    private CookieGenerator cookieGenerator;
    private GitHubOAuth2UserService gitHubOAuth2UserService;
    private OAuth2AuthorizedClientService authorizedClientService;
    private OAuth2LoginSuccessHandler handler;

    @BeforeEach
    void setUp() {
        userService = mock(UserService.class);
        jwtTokenUtil = mock(JwtTokenUtil.class);
        cookieGenerator = mock(CookieGenerator.class);
        gitHubOAuth2UserService = mock(GitHubOAuth2UserService.class);
        authorizedClientService = mock(OAuth2AuthorizedClientService.class);
        handler = new OAuth2LoginSuccessHandler(userService, jwtTokenUtil, cookieGenerator,
                gitHubOAuth2UserService, authorizedClientService);
    }

    @Test
    void onAuthenticationSuccess_withValidOAuth2Token_redirectsAndSetsCookies() throws IOException {
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        OAuth2AuthenticationToken authentication = mock(OAuth2AuthenticationToken.class);
        OAuth2User oauth2User = mock(OAuth2User.class);
        User user = mock(User.class);
        HttpSession session = mock(HttpSession.class);

        when(authentication.getPrincipal()).thenReturn(oauth2User);
        when(authentication.getAuthorizedClientRegistrationId()).thenReturn("google"); // Use Google to avoid
                                                                                       // GitHub-specific logic
        when(userService.registerOrUpdateUser(oauth2User)).thenReturn(user);
        when(jwtTokenUtil.generateAccessToken(user)).thenReturn("access-token");
        when(jwtTokenUtil.generateRefreshToken(user)).thenReturn("refresh-token");
        when(jwtTokenUtil.getAccessTokenExpiration()).thenReturn(3600000L);
        when(jwtTokenUtil.getRefreshTokenExpiration()).thenReturn(7200000L);

        Cookie accessCookie = new Cookie("accessToken", "access-token");
        Cookie refreshCookie = new Cookie("refreshToken", "refresh-token");
        when(cookieGenerator.createCookie(eq("accessToken"), eq("access-token"), eq("/"), anyInt()))
                .thenReturn(accessCookie);
        when(cookieGenerator.createCookie(eq("refreshToken"), eq("refresh-token"), eq("/"), anyInt()))
                .thenReturn(refreshCookie);

        when(request.getSession()).thenReturn(session);
        when(session.getAttribute("redirectUri")).thenReturn("http://localhost:3000/redirect");

        handler.onAuthenticationSuccess(request, response, authentication);

        verify(response).addCookie(accessCookie);
        verify(response).addCookie(refreshCookie);
        verify(response).sendRedirect("http://localhost:3000/redirect");
    }

    @Test
    void onAuthenticationSuccess_missingRedirectUri_sendsBadRequest() throws IOException {
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        OAuth2AuthenticationToken authentication = mock(OAuth2AuthenticationToken.class);
        OAuth2User oauth2User = mock(OAuth2User.class);
        User user = mock(User.class);
        HttpSession session = mock(HttpSession.class);

        when(authentication.getPrincipal()).thenReturn(oauth2User);
        when(authentication.getAuthorizedClientRegistrationId()).thenReturn("google"); // Use Google to avoid
                                                                                       // GitHub-specific logic
        when(userService.registerOrUpdateUser(oauth2User)).thenReturn(user);
        when(jwtTokenUtil.generateAccessToken(user)).thenReturn("access-token");
        when(jwtTokenUtil.generateRefreshToken(user)).thenReturn("refresh-token");
        when(jwtTokenUtil.getAccessTokenExpiration()).thenReturn(3600000L);
        when(jwtTokenUtil.getRefreshTokenExpiration()).thenReturn(7200000L);

        Cookie accessCookie = new Cookie("accessToken", "access-token");
        Cookie refreshCookie = new Cookie("refreshToken", "refresh-token");
        when(cookieGenerator.createCookie(eq("accessToken"), eq("access-token"), eq("/"), anyInt()))
                .thenReturn(accessCookie);
        when(cookieGenerator.createCookie(eq("refreshToken"), eq("refresh-token"), eq("/"), anyInt()))
                .thenReturn(refreshCookie);

        when(request.getSession()).thenReturn(session);
        when(session.getAttribute("redirectUri")).thenReturn(null);

        handler.onAuthenticationSuccess(request, response, authentication);

        verify(response).sendError(HttpServletResponse.SC_BAD_REQUEST, "Redirect URI is missing.");
    }

    @Test
    void onAuthenticationSuccess_withNonOAuth2Token_sendsUnauthorized() throws IOException {
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        Authentication authentication = mock(Authentication.class);

        handler.onAuthenticationSuccess(request, response, authentication);

        verify(response).sendError(HttpServletResponse.SC_UNAUTHORIZED, "Authentication failed.");
    }
}