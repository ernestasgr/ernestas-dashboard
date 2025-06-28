package com.ernestas.auth.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * HealthController provides a simple health check endpoint for the application.
 * It responds to HTTP GET requests at the /health endpoint.
 */
@RestController
public class HealthController {
    /**
     * Handles HTTP GET requests to the /health endpoint and returns a simple health
     * status.
     *
     * @return the string "OK" indicating the service is healthy
     */
    @GetMapping("/health")
    public String health() {
        return "OK";
    }

    /**
     * Handles HTTP GET requests to the /debug-sentry endpoint and returns a debug
     * message.
     *
     * @return the string "Debug Sentry endpoint hit" for debugging purposes
     */
    @GetMapping("/debug-sentry")
    public String debugSentry() {
        throw new RuntimeException("Debug Sentry endpoint hit");
    }
}