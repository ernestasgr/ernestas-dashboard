package com.ernestas.auth.graphql;

import org.springframework.boot.autoconfigure.graphql.GraphQlSourceBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.graphql.data.federation.FederationSchemaFactory;

/**
 * Configuration class for GraphQL Federation.
 * This class sets up the necessary beans for GraphQL federation in the
 * application.
 */
@Configuration
public class FederationConfig {

    /**
     * Customizes the GraphQL source builder to use the Federation schema factory.
     *
     * @param factory the FederationSchemaFactory instance
     * @return a GraphQlSourceBuilderCustomizer that applies the federation schema
     */
    @Bean
    GraphQlSourceBuilderCustomizer customizer(FederationSchemaFactory factory) {
        return builder -> builder.schemaFactory(factory::createGraphQLSchema);
    }

    /**
     * Provides a FederationSchemaFactory bean for creating GraphQL schemas.
     *
     * @return a FederationSchemaFactory instance
     */
    @Bean
    FederationSchemaFactory schemaFactory() {
        return new FederationSchemaFactory();
    }
}