package com.ernestas.auth.security;

import com.ernestas.auth.model.User;
import com.ernestas.auth.service.UserService;
import com.ernestas.auth.util.CookieGenerator;
import com.ernestas.auth.util.JwtTokenUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class OAuth2LoginSuccessHandlerTest {

    private UserService userService;
    private JwtTokenUtil jwtTokenUtil;
    private CookieGenerator cookieGenerator;
    private OAuth2LoginSuccessHandler handler;

    @BeforeEach
    void setUp() {
        userService = mock(UserService.class);
        jwtTokenUtil = mock(JwtTokenUtil.class);
        cookieGenerator = mock(CookieGenerator.class);
        handler = new OAuth2LoginSuccessHandler(userService, jwtTokenUtil, cookieGenerator);
    }

    @Test
    void shouldGenerateTokensAndRedirectOnSuccess() throws IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        Objects.requireNonNull(request.getSession()).setAttribute("redirectUri", "/dashboard");
        MockHttpServletResponse response = new MockHttpServletResponse();

        OAuth2User oauth2User = new DefaultOAuth2User(
                List.of(), Map.of("email", "test@example.com"), "email");
        OAuth2AuthenticationToken token = mock(OAuth2AuthenticationToken.class);
        when(token.getPrincipal()).thenReturn(oauth2User);

        User user = new User();
        when(userService.registerOrUpdateUser(oauth2User)).thenReturn(user);
        when(jwtTokenUtil.generateAccessToken(user)).thenReturn("access-token");
        when(jwtTokenUtil.generateRefreshToken(user)).thenReturn("refresh-token");
        when(jwtTokenUtil.getAccessTokenExpiration()).thenReturn(3600L);
        when(jwtTokenUtil.getRefreshTokenExpiration()).thenReturn(86400L);

        Cookie accessCookie = new Cookie("accessToken", "access-token");
        Cookie refreshCookie = new Cookie("refreshToken", "refresh-token");
        when(cookieGenerator.createCookie("accessToken", "access-token", "/", 3600)).thenReturn(accessCookie);
        when(cookieGenerator.createCookie("refreshToken", "refresh-token", "/refresh/", 86400)).thenReturn(refreshCookie);

        handler.onAuthenticationSuccess(request, response, token);

        assertEquals("/dashboard", response.getRedirectedUrl());
        assertEquals(2, response.getCookies().length);
        assertEquals("accessToken", response.getCookies()[0].getName());
        assertEquals("refreshToken", response.getCookies()[1].getName());
    }

    @Test
    void shouldReturn400IfRedirectUriMissing() throws IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        OAuth2User oauth2User = new DefaultOAuth2User(
                List.of(), Map.of("email", "test@example.com"), "email");
        OAuth2AuthenticationToken token = mock(OAuth2AuthenticationToken.class);
        when(token.getPrincipal()).thenReturn(oauth2User);

        User user = new User();
        when(userService.registerOrUpdateUser(oauth2User)).thenReturn(user);
        when(jwtTokenUtil.generateAccessToken(user)).thenReturn("access-token");
        when(jwtTokenUtil.generateRefreshToken(user)).thenReturn("refresh-token");
        when(jwtTokenUtil.getAccessTokenExpiration()).thenReturn(3600L);
        when(jwtTokenUtil.getRefreshTokenExpiration()).thenReturn(86400L);

        Cookie accessCookie = new Cookie("accessToken", "access-token");
        Cookie refreshCookie = new Cookie("refreshToken", "refresh-token");
        when(cookieGenerator.createCookie("accessToken", "access-token", "/", 3600)).thenReturn(accessCookie);
        when(cookieGenerator.createCookie("refreshToken", "refresh-token", "/refresh/", 86400)).thenReturn(refreshCookie);

        handler.onAuthenticationSuccess(request, response, token);

        assertEquals(HttpServletResponse.SC_BAD_REQUEST, response.getStatus());
        assertNull(response.getRedirectedUrl());
    }

    @Test
    void shouldReturn401IfAuthenticationNotOAuth2() throws IOException {
        Authentication nonOAuthAuthentication = mock(Authentication.class);
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        handler.onAuthenticationSuccess(request, response, nonOAuthAuthentication);

        assertEquals(HttpServletResponse.SC_UNAUTHORIZED, response.getStatus());
    }
}
