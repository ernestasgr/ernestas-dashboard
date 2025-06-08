package com.ernestas.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main application class for the authentication service.
 */
@SpringBootApplication
public class AuthApplication {
    private static final Logger logger = LoggerFactory.getLogger(AuthApplication.class);

    /****
     * Launches the AuthApplication Spring Boot service.
     *
     * @param args command-line arguments passed to the application
     */
    public static void main(String[] args) {
        logger.info("Starting AuthApplication...");
        SpringApplication.run(AuthApplication.class, args);
    }
}
