package com.ernestas.auth.graphql.dto;

/**
 * Data Transfer Object (DTO) for authentication payload.
 * This class represents the payload returned after a successful authentication.
 */
public record AuthPayload(String email, String name) {
}
