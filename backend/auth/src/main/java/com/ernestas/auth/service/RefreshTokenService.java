package com.ernestas.auth.service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ernestas.auth.model.RefreshToken;
import com.ernestas.auth.model.User;
import com.ernestas.auth.repository.RefreshTokenRepository;

/**
 * Service class for managing refresh token lifecycle including creation,
 * validation, and rotation.
 */
@Service
@Transactional
public class RefreshTokenService {

    private static final Logger logger = LoggerFactory.getLogger(RefreshTokenService.class);
    private static final int MAX_ACTIVE_TOKENS_PER_USER = 5;
    private static final SecureRandom secureRandom = new SecureRandom();

    private final RefreshTokenRepository refreshTokenRepository;

    /**
     * Constructor for RefreshTokenService.
     *
     * @param refreshTokenRepository the repository for refresh token persistence
     */
    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    /**
     * Generates a new unique token ID for refresh tokens.
     *
     * @return a cryptographically secure random token ID
     */
    public String generateTokenId() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    /**
     * Hashes a token value using SHA-256.
     *
     * @param token the token to hash
     * @return the hashed token
     * @throws RuntimeException if hashing fails
     */
    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes());
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Failed to hash token", e);
        }
    }

    /**
     * Stores a refresh token in the database with automatic cleanup of old tokens.
     *
     * @param tokenId    the unique identifier for the token
     * @param tokenValue the actual token value to be hashed and stored
     * @param user       the user this token belongs to
     * @param expiresAt  when this token expires
     * @return the persisted RefreshToken entity
     */
    public RefreshToken storeRefreshToken(String tokenId, String tokenValue, User user, LocalDateTime expiresAt) {
        cleanupTokensForUser(user);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setTokenId(tokenId);
        refreshToken.setHashedToken(hashToken(tokenValue));
        refreshToken.setUser(user);
        refreshToken.setExpiresAt(expiresAt);
        refreshToken.setCreatedAt(LocalDateTime.now());

        RefreshToken savedToken = refreshTokenRepository.save(refreshToken);
        logger.debug("Stored refresh token for user: {}", user.getEmail());

        return savedToken;
    }

    /**
     * Validates a refresh token by checking its existence, expiration, and
     * revocation status.
     *
     * @param tokenId    the token ID to validate
     * @param tokenValue the token value to verify against the stored hash
     * @return the valid RefreshToken if found and valid, empty otherwise
     */
    @Transactional(readOnly = true)
    public Optional<RefreshToken> validateRefreshToken(String tokenId, String tokenValue) {
        Optional<RefreshToken> tokenOpt = refreshTokenRepository.findByTokenId(tokenId);

        if (tokenOpt.isEmpty()) {
            logger.warn("Refresh token not found: {}", tokenId);
            return Optional.empty();
        }

        RefreshToken refreshToken = tokenOpt.get();

        if (!refreshToken.isValid()) {
            logger.warn("Refresh token is invalid (expired or revoked): {}", tokenId);
            return Optional.empty();
        }

        String expectedHash = hashToken(tokenValue);
        if (!expectedHash.equals(refreshToken.getHashedToken())) {
            logger.warn("Refresh token hash mismatch: {}", tokenId);
            return Optional.empty();
        }

        return Optional.of(refreshToken);
    }

    /**
     * Revokes a specific refresh token.
     *
     * @param tokenId the ID of the token to revoke
     */
    public void revokeRefreshToken(String tokenId) {
        Optional<RefreshToken> tokenOpt = refreshTokenRepository.findByTokenId(tokenId);
        if (tokenOpt.isPresent()) {
            RefreshToken token = tokenOpt.get();
            token.revoke();
            refreshTokenRepository.save(token);
            logger.debug("Revoked refresh token: {}", tokenId);
        }
    }

    /**
     * Revokes all refresh tokens for a user. Useful for logout or security
     * incidents.
     *
     * @param user the user whose tokens should be revoked
     */
    public void revokeAllTokensForUser(User user) {
        int revokedCount = refreshTokenRepository.revokeAllTokensForUser(user, LocalDateTime.now());
        logger.info("Revoked {} refresh tokens for user: {}", revokedCount, user.getEmail());
    }

    /**
     * Cleans up tokens for a user to enforce maximum active tokens limit.
     * Removes oldest tokens if the user has too many active tokens.
     *
     * @param user the user whose tokens to clean up
     */
    private void cleanupTokensForUser(User user) {
        List<RefreshToken> activeTokens = refreshTokenRepository.findActiveTokensByUser(user, LocalDateTime.now());

        if (activeTokens.size() >= MAX_ACTIVE_TOKENS_PER_USER) {
            List<RefreshToken> allTokens = refreshTokenRepository.findByUserOrderByCreatedAtDesc(user);

            for (int i = MAX_ACTIVE_TOKENS_PER_USER - 1; i < allTokens.size(); i++) {
                RefreshToken token = allTokens.get(i);
                if (!token.isRevoked()) {
                    token.revoke();
                    refreshTokenRepository.save(token);
                }
            }

            logger.debug("Cleaned up old refresh tokens for user: {}", user.getEmail());
        }
    }

    /**
     * Removes expired refresh tokens from the database.
     * This method should be called periodically to clean up the database.
     *
     * @return the number of expired tokens that were deleted
     */
    public int cleanupExpiredTokens() {
        int deletedCount = refreshTokenRepository.deleteExpiredTokens(LocalDateTime.now());
        if (deletedCount > 0) {
            logger.info("Deleted {} expired refresh tokens", deletedCount);
        }
        return deletedCount;
    }
}
