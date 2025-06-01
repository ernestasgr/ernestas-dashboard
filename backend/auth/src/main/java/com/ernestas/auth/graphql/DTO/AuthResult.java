package com.ernestas.auth.graphql.DTO;

public sealed interface AuthResult permits AuthPayload, AuthError {
}
