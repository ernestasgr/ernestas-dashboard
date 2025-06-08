package com.ernestas.auth.graphql;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Objects;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.graphql.server.WebGraphQlInterceptor.Chain;
import org.springframework.graphql.server.WebGraphQlRequest;
import org.springframework.graphql.server.WebGraphQlResponse;
import org.springframework.http.HttpHeaders;

import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

class RequestContextInterceptorTest {

    private RequestContextInterceptor interceptor;

    @BeforeEach
    void setUp() {
        interceptor = new RequestContextInterceptor();
    }

    @Test
    void testIntercept_withTokensInCookies() {
        WebGraphQlRequest request = mock(WebGraphQlRequest.class);
        Chain chain = mock(Chain.class);
        WebGraphQlResponse response = mock(WebGraphQlResponse.class);

        String cookieHeader = "accessToken=abc123; refreshToken=def456";
        HttpHeaders headers = new HttpHeaders();
        headers.put(HttpHeaders.COOKIE, List.of(cookieHeader));

        when(request.getHeaders()).thenReturn(headers);
        when(chain.next(any())).thenReturn(Mono.just(response));

        Mono<WebGraphQlResponse> result = interceptor.intercept(request, chain);

        StepVerifier.create(result)
                .expectNext(response)
                .verifyComplete();
        verify(request).configureExecutionInput(any());
    }

    @Test
    void testIntercept_withoutTokensInCookies() {
        WebGraphQlRequest request = mock(WebGraphQlRequest.class);
        Chain chain = mock(Chain.class);
        WebGraphQlResponse response = mock(WebGraphQlResponse.class);

        HttpHeaders headers = new HttpHeaders();
        headers.put(HttpHeaders.COOKIE, List.of("otherCookie=xyz"));

        when(request.getHeaders()).thenReturn(headers);
        when(chain.next(any())).thenReturn(Mono.just(response));

        Mono<WebGraphQlResponse> result = interceptor.intercept(request, chain);

        assertNotNull(result.block());
        verify(request, never()).configureExecutionInput(any());
    }

    @Test
    void testGetValueFromCookies_returnsNullIfNoCookie() {
        WebGraphQlRequest request = mock(WebGraphQlRequest.class);
        HttpHeaders headers = new HttpHeaders();
        when(request.getHeaders()).thenReturn(headers);

        String value = interceptor.getValueFromCookies(request, "accessToken");
        assertNull(value);
    }

    @Test
    void testParseCookieHeader_parsesMultipleCookies() {
        String cookieHeader = "accessToken=abc; refreshToken=def; other=xyz";
        var cookies = interceptor.parseCookieHeader(cookieHeader);

        assertEquals("abc", Objects.requireNonNull(cookies.getFirst("accessToken")).getValue());
        assertEquals("def", Objects.requireNonNull(cookies.getFirst("refreshToken")).getValue());
        assertEquals("xyz", Objects.requireNonNull(cookies.getFirst("other")).getValue());
    }
}