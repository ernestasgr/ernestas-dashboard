package com.ernestas.auth.graphql;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import java.util.Objects;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
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
        interceptor = new ResponseContextInterceptor();
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

    @Test
    void shouldSetCookiesIfOperationNameContainsRefresh() {
        when(request.getOperationName()).thenReturn("MutationRefreshToken");
        when(chain.next(request)).thenReturn(Mono.just(response));

        // Mock GraphQLContext
        graphql.GraphQLContext context = graphql.GraphQLContext.newContext()
                .of("accessToken", "access-token-value")
                .of("refreshToken", "refresh-token-value")
                .build();

        var executionInput = mock(graphql.ExecutionInput.class);
        when(response.getExecutionInput()).thenReturn(executionInput);
        when(executionInput.getGraphQLContext()).thenReturn(context);

        HttpHeaders headers = new HttpHeaders();
        when(response.getResponseHeaders()).thenReturn(headers);

        Mono<WebGraphQlResponse> result = interceptor.intercept(request, chain);

        result.block();

        assertTrue(Objects.requireNonNull(headers.get(HttpHeaders.SET_COOKIE)).stream()
                .anyMatch(cookie -> cookie.contains("accessToken=access-token-value")));
        assertTrue(Objects.requireNonNull(headers.get(HttpHeaders.SET_COOKIE)).stream()
                .anyMatch(cookie -> cookie.contains("refreshToken=refresh-token-value")));
    }
}