package com.ernestas.auth.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.Cookie;

/**
 * Utility class for generating secure HTTP-only cookies.
 * This class provides methods to create cookies with specific attributes.
 */
@Component
public class CookieGenerator {
    @Value("${profile}")
    private String profile;

    /**
     * Creates a secure HTTP-only cookie with the specified parameters.
     *
     * @param name   the name of the cookie
     * @param value  the value of the cookie
     * @param path   the path for which the cookie is valid
     * @param maxAge the maximum age of the cookie in seconds
     * @return a Cookie object with the specified parameters
     */
    public Cookie createCookie(String name, String value, String path, int maxAge) {
        Cookie cookie = new Cookie(name, value);
        cookie.setMaxAge(maxAge);
        cookie.setPath(path);
        cookie.setSecure(profile.equals("prod")); // Set secure flag only in production
        cookie.setHttpOnly(true);
        return cookie;
    }
}