package com.ernestas.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Main application class for the authentication service.
 */
@SpringBootApplication
public class AuthApplication {
    private static final Logger logger = LoggerFactory.getLogger(AuthApplication.class);

    /**
     * Main method to run the Spring Boot application.
     *
     * @param args command-line arguments
     */
    public static void main(String[] args) {
        logger.info("Starting AuthApplication...");
        SpringApplication.run(AuthApplication.class, args);
    }

    @RestController
    public static class HelloController {
        @GetMapping("/test/")
        public String hello() {
            try {
                throw new RuntimeException("Hello, World!");
            } catch (RuntimeException e) {
                logger.error("An error occurred: {}", e.getMessage(), e);
                return "An error occurred: " + e.getMessage();
            }

        }
    }
}
