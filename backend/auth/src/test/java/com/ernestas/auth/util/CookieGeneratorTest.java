package com.ernestas.auth.util;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import jakarta.servlet.http.Cookie;

class CookieGeneratorTest {
    private CookieGenerator cookieGenerator = new CookieGenerator("test", "localhost");

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
