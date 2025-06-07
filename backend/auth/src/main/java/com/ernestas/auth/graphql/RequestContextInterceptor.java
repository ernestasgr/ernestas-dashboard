package com.ernestas.auth.graphql;

import java.util.List;

import org.springframework.graphql.server.WebGraphQlInterceptor;
import org.springframework.graphql.server.WebGraphQlRequest;
import org.springframework.graphql.server.WebGraphQlResponse;
import org.springframework.http.HttpCookie;
import org.springframework.http.HttpHeaders;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import reactor.core.publisher.Mono;

@Component
class RequestContextInterceptor implements WebGraphQlInterceptor {
    private static final String ACCESS_TOKEN_COOKIE_NAME = "accessToken";
    private static final String REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

    /**
     * Intercepts a GraphQL request to extract authentication tokens from cookies and adds them to the GraphQL context.
     *
     * If "accessToken" or "refreshToken" cookies are present in the request, their values are added to the GraphQL execution context under the keys "accessToken" and "refreshToken" respectively before proceeding with the interceptor chain.
     *
     * @param request the incoming GraphQL request
     * @param chain the interceptor chain
     * @return a Mono emitting the GraphQL response after processing the request
     */
    @Override
    @NonNull
    public Mono<WebGraphQlResponse> intercept(@NonNull WebGraphQlRequest request, @NonNull Chain chain) {
        String accessToken = getValueFromCookies(request, ACCESS_TOKEN_COOKIE_NAME);
        String refreshToken = getValueFromCookies(request, REFRESH_TOKEN_COOKIE_NAME);

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

    /**
     * Retrieves the value of a specified cookie from the request's "Cookie" headers.
     *
     * @param request the GraphQL request containing HTTP headers
     * @param cookieName the name of the cookie to retrieve
     * @return the value of the first matching cookie, or {@code null} if not found
     */
    String getValueFromCookies(WebGraphQlRequest request, String cookieName) {
        List<String> cookieHeaders = request.getHeaders().get(HttpHeaders.COOKIE);
        if (cookieHeaders != null) {
            for (String cookieHeader : cookieHeaders) {
                List<HttpCookie> accessTokenCookies = parseCookieHeader(cookieHeader).get(cookieName);
                if (accessTokenCookies != null && !accessTokenCookies.isEmpty()) {
                    return accessTokenCookies.getFirst().getValue();
                }
            }
        }
        return null;
    }

    /**
     * Parses a cookie header string into a map of cookie names to their corresponding {@link HttpCookie} objects.
     *
     * @param cookieHeader the raw "Cookie" HTTP header string
     * @return a map where each key is a cookie name and the value is a list of {@link HttpCookie} objects with that name
     */
    MultiValueMap<String, HttpCookie> parseCookieHeader(String cookieHeader) {
        org.springframework.util.LinkedMultiValueMap<String, HttpCookie> cookies = new LinkedMultiValueMap<>();
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