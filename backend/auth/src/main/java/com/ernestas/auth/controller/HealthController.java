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
     * Responds to HTTP GET requests at the /health endpoint with a simple health status.
     *
     * @return the string "OK" to indicate the service is healthy
     */
    @GetMapping("/health")
    public String health() {
        return "OK";
    }
}