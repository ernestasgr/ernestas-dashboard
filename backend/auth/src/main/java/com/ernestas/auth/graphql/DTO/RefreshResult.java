package com.ernestas.auth.graphql.DTO;

public class RefreshResult {
    private String accessToken;
    private String refreshToken;
    private String message;

    public RefreshResult(String accessToken, String refreshToken, String message) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.message = message;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public String getMessage() {
        return message;
    }
}
