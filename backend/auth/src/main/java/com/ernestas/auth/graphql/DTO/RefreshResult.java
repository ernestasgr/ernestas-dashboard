package com.ernestas.auth.graphql.dto;

/**
 * Represents the result of a refresh operation, containing access and refresh
 * tokens along with a message.
 */
public record RefreshResult(String message) {
}