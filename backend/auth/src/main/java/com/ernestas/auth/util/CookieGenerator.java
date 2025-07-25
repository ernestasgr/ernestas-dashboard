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
    private final String profile;
    private final String domain;

    /**
     * Constructs a CookieGenerator with the specified active Spring profile.
     *
     * @param profile the active Spring profile, defaults to "dev" if not set
     */
    public CookieGenerator(@Value("${spring.profiles.active:dev}") String profile,
            @Value("${domain:localhost}") String domain) {
        this.profile = profile;
        this.domain = domain;
    }

    /**
     * Creates an HTTP-only cookie with the specified name, value, path, and maximum
     * age.
     *
     * <p>
     * The cookie's secure flag is set only if the active profile is "prod".
     * </p>
     *
     * @param name   the cookie name
     * @param value  the cookie value
     * @param path   the path for which the cookie is valid
     * @param maxAge the maximum age of the cookie in seconds
     * @return a configured Cookie instance
     */
    public Cookie createCookie(String name, String value, String path, int maxAge) {
        Cookie cookie = new Cookie(name, value);
        cookie.setMaxAge(maxAge);
        cookie.setPath(path);
        cookie.setSecure(profile.equals("prod")); // Set secure flag only in production
        cookie.setHttpOnly(true);
        cookie.setDomain(domain);
        return cookie;
    }
}