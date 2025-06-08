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
     * Converts specific authentication token exceptions thrown during GraphQL data fetching into a single GraphQLError with validation error details.
     *
     * <p>
     * Returns a GraphQLError of type ValidationError if the exception is an InvalidAccessTokenException or InvalidRefreshTokenException, including the exception message, query path, and source location. Returns null for all other exceptions to allow default error handling.
     * </p>
     *
     * @param ex the exception thrown during data fetching
     * @param env the data fetching environment with execution context
     * @return a GraphQLError for invalid token exceptions, or null for other exception types
     */
    @Override
    protected GraphQLError resolveToSingleError(@NonNull Throwable ex, @NonNull DataFetchingEnvironment env) {
        if (ex instanceof InvalidAccessTokenException || ex instanceof InvalidRefreshTokenException) {
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