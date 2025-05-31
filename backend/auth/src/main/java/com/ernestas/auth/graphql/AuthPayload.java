package com.ernestas.auth.graphql;

public final class AuthPayload implements AuthResult {
    private String email;
    private String name;

    public AuthPayload(String email, String name) {
        this.email = email;
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public String getName() {
        return name;
    }
}
