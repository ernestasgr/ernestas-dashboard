package com.ernestas.auth.graphql;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.graphql.server.WebGraphQlInterceptor;
import org.springframework.graphql.server.WebGraphQlRequest;
import org.springframework.graphql.server.WebGraphQlResponse;
import org.springframework.http.HttpCookie;
import org.springframework.http.HttpHeaders;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;

import reactor.core.publisher.Mono;

@Component
class RequestContextInterceptor implements WebGraphQlInterceptor {
    private static final String ACCESS_TOKEN_COOKIE_NAME = "accessToken";
    private static final String REFRESH_TOKEN_COOKIE_NAME = "refreshToken";
    private static final Logger logger = LoggerFactory.getLogger(RequestContextInterceptor.class);

    @Override
    @NonNull
    public Mono<WebGraphQlResponse> intercept(@NonNull WebGraphQlRequest request, @NonNull Chain chain) {
        String accessToken = getValueFromCookies(request, ACCESS_TOKEN_COOKIE_NAME);
        String refreshToken = getValueFromCookies(request, REFRESH_TOKEN_COOKIE_NAME);
        logger.info("Access token from cookies: {}", accessToken);
        logger.info("Refresh token from cookies: {}", refreshToken);

        if (accessToken != null || refreshToken != null) {
            request.configureExecutionInput((_, builder) -> builder
                    .graphQLContext(ctxBuilder -> {
                        if (accessToken != null) {
                            ctxBuilder.put("accessToken", accessToken);
                        }
                        if (refreshToken != null) {
                            ctxBuilder.put("refreshToken", refreshToken);
                        }
                    }).build());
        }

        return chain.next(request);
    }

    private String getValueFromCookies(WebGraphQlRequest request, String cookieName) {
        List<String> cookieHeaders = request.getHeaders().get(HttpHeaders.COOKIE);
        if (cookieHeaders != null) {
            for (String cookieHeader : cookieHeaders) {
                List<HttpCookie> accessTokenCookies = parseCookieHeader(cookieHeader).get(cookieName);
                if (accessTokenCookies != null && !accessTokenCookies.isEmpty()) {
                    return accessTokenCookies.get(0).getValue();
                }
            }
        }
        return null;
    }

    private MultiValueMap<String, HttpCookie> parseCookieHeader(String cookieHeader) {
        org.springframework.util.LinkedMultiValueMap<String, HttpCookie> cookies = new org.springframework.util.LinkedMultiValueMap<>();
        String[] pairs = cookieHeader.split(";");
        for (String pair : pairs) {
            String[] parts = pair.trim().split("=", 2);
            if (parts.length == 2) {
                String name = parts[0];
                String value = parts[1];
                cookies.add(name, new HttpCookie(name, value));
            }
        }
        return cookies;
    }
}