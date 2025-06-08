package com.ernestas.auth.graphql.exception;

/**
 * Exception thrown when a refresh token is invalid.
 * This exception is used to indicate that the provided refresh token
 * does not meet the required criteria for authentication or authorization.
 */
public class InvalidRefreshTokenException extends RuntimeException {
    /**
     * Creates an exception indicating that a refresh token is invalid.
     *
     * @param message the detail message describing the reason for the invalid token
     */
    public InvalidRefreshTokenException(String message) {
        super(message);
    }

    /**
     * Constructs a new InvalidRefreshTokenException with the specified detail
     * message and cause.
     *
     * @param message the detail message
     * @param cause   the cause of this exception
     */
    public InvalidRefreshTokenException(String message, Throwable cause) {
        super(message, cause);
    }
}
