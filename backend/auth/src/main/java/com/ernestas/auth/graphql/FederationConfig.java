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
     * Provides a customizer that configures the GraphQL source builder to use a federation-aware schema factory.
     *
     * @param factory the federation schema factory used to generate federated GraphQL schemas
     * @return a customizer that sets the schema factory for GraphQL federation support
     */
    @Bean
    GraphQlSourceBuilderCustomizer customizer(FederationSchemaFactory factory) {
        return builder -> builder.schemaFactory(factory::createGraphQLSchema);
    }

    /****
     * Creates and provides a bean for generating federated GraphQL schemas.
     *
     * @return a new instance of FederationSchemaFactory
     */
    @Bean
    FederationSchemaFactory schemaFactory() {
        return new FederationSchemaFactory();
    }
}