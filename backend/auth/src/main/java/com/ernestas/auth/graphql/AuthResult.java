package com.ernestas.auth.graphql;

public sealed interface AuthResult permits AuthPayload, AuthError {
}
