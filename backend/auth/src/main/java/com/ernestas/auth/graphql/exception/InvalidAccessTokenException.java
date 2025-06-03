package com.ernestas.auth.graphql.exception;

/**
 * Exception thrown when an access token is invalid.
 * This exception is used to indicate that the provided access token
 * does not meet the required criteria for authentication or authorization.
 */
public class InvalidAccessTokenException extends RuntimeException {
    /**
     * Constructs a new InvalidAccessTokenException with the specified detail message.
     *
     * @param message the detail message, which is saved for later retrieval by the
     *                {@link Throwable#getMessage()} method.
     */
    public InvalidAccessTokenException(String message) {
        super(message);
    }
}
