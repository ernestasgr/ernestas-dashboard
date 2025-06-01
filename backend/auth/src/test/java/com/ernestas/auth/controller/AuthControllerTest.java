// package com.ernestas.auth.controller;

// import com.ernestas.auth.model.User;
// import com.ernestas.auth.service.UserService;
// import com.ernestas.auth.util.CookieGenerator;
// import com.ernestas.auth.util.JwtTokenUtil;
// import io.jsonwebtoken.Claims;
// import org.junit.jupiter.api.BeforeEach;
// import org.junit.jupiter.api.Test;
// import org.mockito.InjectMocks;
// import org.mockito.Mock;
// import org.mockito.MockitoAnnotations;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;

// import jakarta.servlet.http.HttpServletResponse;
// import java.io.IOException;
// import java.util.Map;

// import static org.junit.jupiter.api.Assertions.*;
// import static org.mockito.Mockito.*;

// class AuthControllerTest {
// @Mock
// private JwtTokenUtil jwtTokenUtil;
// @Mock
// private UserService userService;
// @Mock
// private CookieGenerator cookieGenerator;
// @Mock
// private HttpServletResponse response;
// @Mock
// private Claims claims;

// @InjectMocks
// private AuthController authController;

// @BeforeEach
// void setUp() throws Exception {
// try (AutoCloseable _ = MockitoAnnotations.openMocks(this)) {
// authController = new AuthController(jwtTokenUtil, userService,
// cookieGenerator);
// }
// }

// @Test
// void getUserInfoValidAccessToken() throws IOException {
// String accessToken = "validAccessToken";
// when(jwtTokenUtil.validateToken(accessToken, "access")).thenReturn(true);
// when(jwtTokenUtil.getTokenType(accessToken)).thenReturn("access");
// when(jwtTokenUtil.parseClaims(accessToken)).thenReturn(claims);
// when(claims.getSubject()).thenReturn("test@example.com");
// when(claims.get("name")).thenReturn("Test User");

// Map<String, Object> result = authController.getUserInfo(accessToken,
// response);
// assertEquals("test@example.com", result.get("email"));
// assertEquals("Test User", result.get("name"));
// }

// @Test
// void getUserInfoInvalidAccessToken() throws IOException {
// String accessToken = "invalidAccessToken";
// when(jwtTokenUtil.validateToken(accessToken, "access")).thenReturn(false);

// Map<String, Object> result = authController.getUserInfo(accessToken,
// response);
// assertEquals("Invalid access token", result.get("message"));
// verify(response).sendRedirect("/refresh/");
// }

// @Test
// void getUserInfoInvalidTokenType() throws IOException {
// String accessToken = "wrongTypeToken";
// when(jwtTokenUtil.validateToken(accessToken, "access")).thenReturn(true);
// when(jwtTokenUtil.getTokenType(accessToken)).thenReturn("refresh");

// Map<String, Object> result = authController.getUserInfo(accessToken,
// response);
// assertEquals("Invalid token type", result.get("message"));
// }

// @Test
// void refreshValidRefreshToken() {
// String refreshToken = "validRefreshToken";
// User user = new User();
// user.setEmail("test@example.com");
// when(jwtTokenUtil.validateToken(refreshToken, "refresh")).thenReturn(true);
// when(jwtTokenUtil.getTokenType(refreshToken)).thenReturn("refresh");
// when(jwtTokenUtil.getUsernameFromToken(refreshToken)).thenReturn("test@example.com");
// when(userService.findUserByEmail("test@example.com")).thenReturn(user);
// when(jwtTokenUtil.generateAccessToken(user)).thenReturn("newAccessToken");
// when(jwtTokenUtil.getAccessTokenExpiration()).thenReturn(3600L);
// when(jwtTokenUtil.generateRefreshToken(user)).thenReturn("newRefreshToken");
// when(jwtTokenUtil.getRefreshTokenExpiration()).thenReturn(7200L);

// ResponseEntity<Map<String, Object>> responseEntity =
// authController.refresh(refreshToken, response);
// assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
// assertNotNull(responseEntity.getBody());
// assertEquals("Access token refreshed",
// responseEntity.getBody().get("message"));
// }

// @Test
// void refreshInvalidRefreshToken() {
// String refreshToken = "invalidRefreshToken";
// when(jwtTokenUtil.validateToken(refreshToken, "refresh")).thenReturn(false);

// ResponseEntity<Map<String, Object>> responseEntity =
// authController.refresh(refreshToken, response);
// assertEquals(HttpStatus.UNAUTHORIZED, responseEntity.getStatusCode());
// assertNotNull(responseEntity.getBody());
// assertEquals("Invalid refresh token",
// responseEntity.getBody().get("message"));
// }

// @Test
// void refreshInvalidTokenType() {
// String refreshToken = "wrongTypeToken";
// when(jwtTokenUtil.validateToken(refreshToken, "refresh")).thenReturn(true);
// when(jwtTokenUtil.getTokenType(refreshToken)).thenReturn("access");

// ResponseEntity<Map<String, Object>> responseEntity =
// authController.refresh(refreshToken, response);
// assertEquals(HttpStatus.UNAUTHORIZED, responseEntity.getStatusCode());
// assertNotNull(responseEntity.getBody());
// assertEquals("Invalid token type", responseEntity.getBody().get("message"));
// }
// }
