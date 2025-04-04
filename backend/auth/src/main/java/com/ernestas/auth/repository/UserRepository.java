package com.ernestas.auth.repository;

import com.ernestas.auth.model.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository interface for accessing and managing {@link User} entities.
 */
public interface UserRepository extends JpaRepository<User, Integer> {
    /**
     * Finds a user by their email address.
     *
     * @param email the email address of the user
     * @return an {@link Optional} containing the user if found, or empty if not found
     */
    Optional<User> findByEmail(String email);
}
