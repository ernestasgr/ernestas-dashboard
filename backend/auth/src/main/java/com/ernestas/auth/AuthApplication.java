package com.ernestas.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Main application class for the authentication service.
 */
@SpringBootApplication
public class AuthApplication {
    /**
     * Main method to run the Spring Boot application.
     *
     * @param args command-line arguments
     */
    public static void main(String[] args) {
        SpringApplication.run(AuthApplication.class, args);
    }

    /**
     * Test controller for handling test endpoints.
     */
    @RestController
    @RequestMapping("/api")
    public static class TestController {
        /**
         * Endpoint for testing the application.
         *
         * @return a message indicating the test endpoint is working
         */
        @GetMapping("/test")
        public String testEndpoint() {
            return "Test endpoint is working!";
        }
    }
}
