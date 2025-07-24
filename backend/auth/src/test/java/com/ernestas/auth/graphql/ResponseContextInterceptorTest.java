package com.ernestas.auth.graphql;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.Objects;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.graphql.ResponseError;
import org.springframework.graphql.server.WebGraphQlRequest;
import org.springframework.graphql.server.WebGraphQlResponse;
import org.springframework.http.HttpHeaders;

import reactor.core.publisher.Mono;

class ResponseContextInterceptorTest {

    private ResponseContextInterceptor interceptor;
    private ResponseContextInterceptor.Chain chain;
    private WebGraphQlRequest request;
    private WebGraphQlResponse response;

    @BeforeEach
    void setUp() {
        interceptor = new ResponseContextInterceptor("dev", "localhost");
        chain = mock(ResponseContextInterceptor.Chain.class);
        request = mock(WebGraphQlRequest.class);
        response = mock(WebGraphQlResponse.class);
    }

    @Test
    void shouldSkipIfOperationNameDoesNotContainRefresh() {
        when(request.getOperationName()).thenReturn("QuerySomething");
        when(chain.next(request)).thenReturn(Mono.just(response));

        Mono<WebGraphQlResponse> result = interceptor.intercept(request, chain);

        assertSame(response, result.block());
        verify(chain, times(1)).next(request);
        verifyNoMoreInteractions(chain);
    }

    private void assertCookieContains(HttpHeaders headers, String expectedCookie) {
        assertTrue(Objects.requireNonNull(headers.get(HttpHeaders.SET_COOKIE)).stream()
                .anyMatch(cookie -> cookie.contains(expectedCookie)));
    }

    @Test
    void shouldSetCookiesIfOperationNameContainsRefreshAndNoErrors() {
        when(request.getOperationName()).thenReturn("MutationRefreshToken");
        when(chain.next(request)).thenReturn(Mono.just(response));

        graphql.GraphQLContext context = graphql.GraphQLContext.newContext()
                .of("accessToken", "access-token-value")
                .of("refreshToken", "refresh-token-value")
                .build();

        var executionInput = mock(graphql.ExecutionInput.class);
        when(response.getExecutionInput()).thenReturn(executionInput);
        when(executionInput.getGraphQLContext()).thenReturn(context);
        when(response.getErrors()).thenReturn(Collections.emptyList());

        HttpHeaders headers = new HttpHeaders();
        when(response.getResponseHeaders()).thenReturn(headers);

        Mono<WebGraphQlResponse> result = interceptor.intercept(request, chain);

        result.block();

        assertCookieContains(headers, "accessToken=access-token-value");
        assertCookieContains(headers, "refreshToken=refresh-token-value");
        assertCookieContains(headers, "Path=/");
        assertCookieContains(headers, "HttpOnly");
        assertCookieContains(headers, "Domain=localhost");
    }

    @Test
    void shouldNotSetCookiesIfOperationHasErrors() {
        when(request.getOperationName()).thenReturn("MutationRefreshToken");
        when(chain.next(request)).thenReturn(Mono.just(response));

        graphql.GraphQLContext context = graphql.GraphQLContext.newContext()
                .of("accessToken", "access-token-value")
                .of("refreshToken", "refresh-token-value")
                .build();

        var executionInput = mock(graphql.ExecutionInput.class);
        when(response.getExecutionInput()).thenReturn(executionInput);
        when(executionInput.getGraphQLContext()).thenReturn(context);
        when(response.getErrors()).thenReturn(Collections.singletonList(mock(ResponseError.class)));

        HttpHeaders headers = new HttpHeaders();
        when(response.getResponseHeaders()).thenReturn(headers);

        Mono<WebGraphQlResponse> result = interceptor.intercept(request, chain);

        result.block();

        assertTrue(headers.isEmpty(), "No cookies should be set when there are errors");
    }

    @Test
    void shouldNotSetCookiesIfTokensAreMissing() {
        when(request.getOperationName()).thenReturn("MutationRefreshToken");
        when(chain.next(request)).thenReturn(Mono.just(response));

        graphql.GraphQLContext context = graphql.GraphQLContext.newContext().build();

        var executionInput = mock(graphql.ExecutionInput.class);
        when(response.getExecutionInput()).thenReturn(executionInput);
        when(executionInput.getGraphQLContext()).thenReturn(context);
        when(response.getErrors()).thenReturn(Collections.emptyList());

        HttpHeaders headers = new HttpHeaders();
        when(response.getResponseHeaders()).thenReturn(headers);

        Mono<WebGraphQlResponse> result = interceptor.intercept(request, chain);

        result.block();

        assertTrue(headers.isEmpty(), "No cookies should be set when tokens are missing");
    }
}