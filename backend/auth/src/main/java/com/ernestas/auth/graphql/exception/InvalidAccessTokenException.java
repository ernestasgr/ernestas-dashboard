package com.ernestas.auth.graphql.exception;

/**
 * Exception thrown when an access token is invalid.
 * This exception is used to indicate that the provided access token
 * does not meet the required criteria for authentication or authorization.
 */
public class InvalidAccessTokenException extends RuntimeException {
    /**
     * Constructs an exception indicating that an access token is invalid.
     *
     * @param message the detail message explaining why the access token is considered invalid
     */
    public InvalidAccessTokenException(String message) {
        super(message);
    }

    /**
     * Creates an InvalidAccessTokenException with a detail message and underlying cause.
     *
     * @param message explanation of why the access token is invalid
     * @param cause the underlying exception that led to this error
     */
    public InvalidAccessTokenException(String message, Throwable cause) {
        super(message, cause);
    }
}
