package com.ernestas.auth.graphql.dto;

import org.springframework.lang.Nullable;

/**
 * Data Transfer Object (DTO) for authentication payload.
 * This class represents the payload returned after a successful authentication.
 */
public record AuthPayload(String email, @Nullable String name) {
}
