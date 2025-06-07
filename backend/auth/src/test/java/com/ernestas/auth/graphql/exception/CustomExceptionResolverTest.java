package com.ernestas.auth.graphql.exception;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import graphql.ErrorType;
import graphql.GraphQLError;
import graphql.execution.ExecutionStepInfo;
import graphql.execution.ResultPath;
import graphql.language.SourceLocation;
import graphql.schema.DataFetchingEnvironment;

class CustomExceptionResolverTest {

    private CustomExceptionResolver resolver;
    private DataFetchingEnvironment mockEnv;

    @BeforeEach
    void setUp() {
        resolver = new CustomExceptionResolver();

        mockEnv = mock(DataFetchingEnvironment.class);
        ExecutionStepInfo stepInfo = mock(ExecutionStepInfo.class);
        when(stepInfo.getPath()).thenReturn(ResultPath.fromList(List.of("query", "someField")));
        when(mockEnv.getExecutionStepInfo()).thenReturn(stepInfo);
        graphql.language.Field mockField = mock(graphql.language.Field.class);
        when(mockField.getSourceLocation()).thenReturn(new SourceLocation(1, 1));
        when(mockEnv.getField()).thenReturn(mockField);
    }

    @Test
    void testResolveToSingleError_withInvalidAccessTokenException() {
        InvalidAccessTokenException ex = new InvalidAccessTokenException("Invalid token");

        GraphQLError error = resolver.resolveToSingleError(ex, mockEnv);

        assertNotNull(error);
        assertEquals("Invalid token", error.getMessage());
        assertEquals(ErrorType.ValidationError, error.getErrorType());
        assertEquals(List.of("query", "someField"), error.getPath());
        assertEquals(1, error.getLocations().getFirst().getLine());
    }

    @Test
    void testResolveToSingleError_withOtherException() {
        RuntimeException ex = new RuntimeException("Other error");

        GraphQLError error = resolver.resolveToSingleError(ex, mockEnv);

        assertNull(error);
    }
}
