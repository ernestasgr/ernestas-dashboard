package com.ernestas.auth.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.ernestas.auth.service.RefreshTokenService;

/**
 * Scheduled tasks for authentication-related maintenance.
 */
@Component
public class AuthScheduledTasks {

    private static final Logger logger = LoggerFactory.getLogger(AuthScheduledTasks.class);

    private final RefreshTokenService refreshTokenService;

    /**
     * Constructor for AuthScheduledTasks.
     *
     * @param refreshTokenService the service for refresh token operations
     */
    public AuthScheduledTasks(RefreshTokenService refreshTokenService) {
        this.refreshTokenService = refreshTokenService;
    }

    /**
     * Cleans up expired refresh tokens from the database.
     * Runs every hour to keep the database clean.
     */
    @Scheduled(fixedRate = 3600000) // 1 hour in milliseconds
    public void cleanupExpiredTokens() {
        logger.debug("Starting cleanup of expired refresh tokens");
        try {
            int deletedCount = refreshTokenService.cleanupExpiredTokens();
            if (deletedCount > 0) {
                logger.info("Cleaned up {} expired refresh tokens", deletedCount);
            }
        } catch (Exception e) {
            logger.error("Error during refresh token cleanup", e);
        }
    }
}
