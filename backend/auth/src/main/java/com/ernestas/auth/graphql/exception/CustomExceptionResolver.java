package com.ernestas.auth.graphql.exception;

import org.springframework.graphql.execution.DataFetcherExceptionResolverAdapter;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

import graphql.ErrorType;
import graphql.GraphQLError;
import graphql.GraphqlErrorBuilder;
import graphql.schema.DataFetchingEnvironment;

/**
 * Custom exception resolver for handling specific exceptions in GraphQL.
 * This resolver converts InvalidAccessTokenException into a GraphQL error
 * with a validation error type.
 */
@Component
public class CustomExceptionResolver extends DataFetcherExceptionResolverAdapter {

    /**
     * Resolves an exception thrown during GraphQL data fetching to a single GraphQLError.
     *
     * If the exception is an InvalidAccessTokenException, returns a GraphQLError with type ValidationError,
     * including the exception message, query path, and source location. For other exceptions, returns null,
     * allowing default error handling to proceed.
     *
     * @param ex  the exception thrown during data fetching
     * @param env the data fetching environment containing context about the GraphQL execution
     * @return a GraphQLError for InvalidAccessTokenException, or null for other exceptions
     */
    @Override
    protected GraphQLError resolveToSingleError(@NonNull Throwable ex, @NonNull DataFetchingEnvironment env) {
        if (ex instanceof InvalidAccessTokenException) {
            return GraphqlErrorBuilder.newError()
                    .errorType(ErrorType.ValidationError)
                    .message(ex.getMessage())
                    .path(env.getExecutionStepInfo().getPath())
                    .location(env.getField().getSourceLocation())
                    .build();
        } else {
            return null;
        }
    }
}