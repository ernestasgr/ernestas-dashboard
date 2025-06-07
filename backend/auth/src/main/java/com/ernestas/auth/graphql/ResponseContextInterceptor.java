package com.ernestas.auth.graphql;

import java.util.Optional;

import org.springframework.graphql.server.WebGraphQlInterceptor;
import org.springframework.graphql.server.WebGraphQlRequest;
import org.springframework.graphql.server.WebGraphQlResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

import reactor.core.publisher.Mono;

@Component
class ResponseContextInterceptor implements WebGraphQlInterceptor {
    private static final String ACCESS_TOKEN_COOKIE_NAME = "accessToken";
    private static final String REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

    @Override
    @NonNull
    public Mono<WebGraphQlResponse> intercept(@NonNull WebGraphQlRequest request, @NonNull Chain chain) {
        if (!Optional.ofNullable(request.getOperationName()).orElse("").contains("Refresh")) {
            return chain.next(request);
        }

        return chain.next(request).doOnNext((response) -> {
            String accessCookieString = response.getExecutionInput().getGraphQLContext().get(ACCESS_TOKEN_COOKIE_NAME);
            ResponseCookie accessCookie = ResponseCookie.from(ACCESS_TOKEN_COOKIE_NAME, accessCookieString).build();
            response.getResponseHeaders().add(HttpHeaders.SET_COOKIE, accessCookie.toString());

            String refreshCookieString = response.getExecutionInput().getGraphQLContext()
                    .get(REFRESH_TOKEN_COOKIE_NAME);
            ResponseCookie refreshCookie = ResponseCookie.from(REFRESH_TOKEN_COOKIE_NAME, refreshCookieString).build();
            response.getResponseHeaders().add(HttpHeaders.SET_COOKIE, refreshCookie.toString());
        });
    }
}