package com.ernestas.auth.graphql;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
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

    private final String profile;
    private final String domain;

    /**
     * Constructs a ResponseContextInterceptor with the specified active Spring profile and domain.
     *
     * @param profile the active Spring profile, defaults to "dev" if not set
     * @param domain the domain for cookie configuration, defaults to "localhost" if not set
     */
    public ResponseContextInterceptor(
            @Value("${spring.profiles.active:dev}") String profile,
            @Value("${domain:localhost}") String domain) {
        this.profile = profile;
        this.domain = domain;
    }

    /**
     * Intercepts GraphQL requests and, for successful operations containing "Refresh" in their name,
     * adds access and refresh token cookies to the response headers with proper security attributes.
     *
     * <p>For non-"Refresh" operations, the request proceeds without modification.
     * Cookies are only set if the operation succeeds and both tokens are present in the context.</p>
     *
     * @param request the incoming GraphQL web request
     * @param chain the interceptor chain
     * @return a Mono emitting the GraphQL response, potentially with added Set-Cookie headers
     *         for access and refresh tokens
     */
    @Override
    @NonNull
    public Mono<WebGraphQlResponse> intercept(@NonNull WebGraphQlRequest request, @NonNull Chain chain) {
        if (!Optional.ofNullable(request.getOperationName()).orElse("").contains("Refresh")) {
            return chain.next(request);
        }

        return chain.next(request).doOnNext((response) -> {
            // Only set cookies if the operation succeeded (no errors in the response)
            if (response.getErrors().isEmpty()) {
                String accessCookieString = response.getExecutionInput().getGraphQLContext().get(ACCESS_TOKEN_COOKIE_NAME);
                String refreshCookieString = response.getExecutionInput().getGraphQLContext().get(REFRESH_TOKEN_COOKIE_NAME);

                // Only set cookies if both tokens are present
                if (accessCookieString != null && refreshCookieString != null) {
                    ResponseCookie accessCookie = ResponseCookie.from(ACCESS_TOKEN_COOKIE_NAME, accessCookieString)
                            .path("/")
                            .httpOnly(true)
                            .secure(profile.equals("prod"))
                            .domain(domain)
                            .build();
                    response.getResponseHeaders().add(HttpHeaders.SET_COOKIE, accessCookie.toString());

                    ResponseCookie refreshCookie = ResponseCookie.from(REFRESH_TOKEN_COOKIE_NAME, refreshCookieString)
                            .path("/")
                            .httpOnly(true)
                            .secure(profile.equals("prod"))
                            .domain(domain)
                            .build();
                    response.getResponseHeaders().add(HttpHeaders.SET_COOKIE, refreshCookie.toString());
                }
            }
        });
    }
}