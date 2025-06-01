package com.ernestas.auth.graphql.DTO;

public final class AuthError implements AuthResult {
    private String message;

    public AuthError(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }
}
