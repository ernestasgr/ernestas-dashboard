package com.ernestas.auth.util;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CookieGeneratorTest {
    private final CookieGenerator cookieGenerator = new CookieGenerator();

    @Test
    void testCreateCookie_setsAllPropertiesCorrectly() {
        String name = "testName";
        String value = "testValue";
        String path = "/testPath";
        int maxAge = 3600;

        Cookie cookie = cookieGenerator.createCookie(name, value, path, maxAge);

        assertEquals(name, cookie.getName());
        assertEquals(value, cookie.getValue());
        assertEquals(path, cookie.getPath());
        assertEquals(maxAge, cookie.getMaxAge());
        assertTrue(cookie.isHttpOnly());
        assertFalse(cookie.getSecure());
    }
}

