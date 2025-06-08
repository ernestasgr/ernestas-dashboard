package com.ernestas.auth.graphql.exception;

/**
 * Exception thrown when an access token is invalid.
 * This exception is used to indicate that the provided access token
 * does not meet the required criteria for authentication or authorization.
 */
public class InvalidAccessTokenException extends RuntimeException {
    /**
     * Creates an exception indicating that an access token is invalid.
     *
     * @param message the detail message describing the reason for the invalid token
     */
    public InvalidAccessTokenException(String message) {
        super(message);
    }

    /**
      * Constructs a new InvalidAccessTokenException with the specified detail message and cause.
      *
      * @param message the detail message
      * @param cause the cause of this exception
      */
    public InvalidAccessTokenException(String message, Throwable cause) {
        super(message, cause);
    }
}
