package com.ernestas.auth.graphql;

import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.graphql.GraphQlSourceBuilderCustomizer;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.graphql.data.federation.FederationSchemaFactory;

import static org.assertj.core.api.Assertions.assertThat;

class FederationConfigTest {

    @Test
    void testBeansAreLoaded() {
        try (var context = new AnnotationConfigApplicationContext(FederationConfig.class)) {
            FederationSchemaFactory schemaFactory = context.getBean(FederationSchemaFactory.class);
            assertThat(schemaFactory).isNotNull();

            GraphQlSourceBuilderCustomizer customizer = context.getBean(GraphQlSourceBuilderCustomizer.class);
            assertThat(customizer).isNotNull();
        }
    }

    @Test
    void testCustomizerAppliesSchemaFactory() {
        FederationConfig config = new FederationConfig();
        FederationSchemaFactory factory = new FederationSchemaFactory();
        GraphQlSourceBuilderCustomizer customizer = config.customizer(factory);

        assertThat(customizer).isNotNull();
    }
}
