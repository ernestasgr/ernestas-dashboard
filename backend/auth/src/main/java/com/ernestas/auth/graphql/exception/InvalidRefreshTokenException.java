package com.ernestas.auth.graphql.exception;

/**
 * Exception thrown when a refresh token is invalid.
 * This exception is used to indicate that the provided refresh token
 * does not meet the required criteria for authentication or authorization.
 */
public class InvalidRefreshTokenException extends RuntimeException {
    /**
     * Constructs an InvalidRefreshTokenException with a specified detail message.
     *
     * @param message the detail message explaining why the refresh token is invalid
     */
    public InvalidRefreshTokenException(String message) {
        super(message);
    }

    /**
     * Creates a new InvalidRefreshTokenException with a specified detail message and underlying cause.
     *
     * @param message explanation of why the refresh token is considered invalid
     * @param cause the underlying cause of this exception
     */
    public InvalidRefreshTokenException(String message, Throwable cause) {
        super(message, cause);
    }
}
