package com.ernestas.auth.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ernestas.auth.model.RefreshToken;
import com.ernestas.auth.model.User;

/**
 * Repository interface for accessing and managing {@link RefreshToken}
 * entities.
 */
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    /**
     * Finds a refresh token by its token ID.
     *
     * @param tokenId the token ID to search for
     * @return an {@link Optional} containing the refresh token if found, or empty
     *         if not found
     */
    Optional<RefreshToken> findByTokenId(String tokenId);

    /**
     * Finds all active (non-revoked and non-expired) refresh tokens for a user.
     *
     * @param user the user whose active tokens to find
     * @param now  the current timestamp for expiration checking
     * @return a list of active refresh tokens for the user
     */
    @Query("SELECT rt FROM RefreshToken rt WHERE rt.user = :user AND rt.revoked = false AND rt.expiresAt > :now")
    List<RefreshToken> findActiveTokensByUser(@Param("user") User user, @Param("now") LocalDateTime now);

    /**
     * Revokes all active refresh tokens for a user.
     *
     * @param user      the user whose tokens should be revoked
     * @param revokedAt the timestamp when the tokens were revoked
     * @return the number of tokens that were revoked
     */
    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.revoked = true, rt.revokedAt = :revokedAt WHERE rt.user = :user AND rt.revoked = false")
    int revokeAllTokensForUser(@Param("user") User user, @Param("revokedAt") LocalDateTime revokedAt);

    /**
     * Deletes all expired refresh tokens.
     *
     * @param now the current timestamp for expiration checking
     * @return the number of expired tokens that were deleted
     */
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiresAt < :now")
    int deleteExpiredTokens(@Param("now") LocalDateTime now);

    /**
     * Finds all refresh tokens for a user, ordered by creation date descending.
     *
     * @param user the user whose tokens to find
     * @return a list of refresh tokens for the user
     */
    List<RefreshToken> findByUserOrderByCreatedAtDesc(User user);
}
