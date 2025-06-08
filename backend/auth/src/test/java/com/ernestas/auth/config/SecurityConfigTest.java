package com.ernestas.auth.config;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.web.cors.CorsConfigurationSource;

import com.ernestas.auth.security.OAuth2LoginSuccessHandler;

class SecurityConfigTest {
    private static final String TEST_GATEWAY_SECRET = "secret";
    private static final String TEST_FRONTEND_DOMAIN = "http://localhost:3000";

    @Test
    void securityFilterChainBeanIsCreated() throws Exception {
        OAuth2LoginSuccessHandler successHandler = Mockito.mock(OAuth2LoginSuccessHandler.class);
        ClientRegistrationRepository clientRegistrationRepository = Mockito.mock(ClientRegistrationRepository.class);
        SecurityConfig config = new SecurityConfig(successHandler, clientRegistrationRepository, TEST_GATEWAY_SECRET,
                TEST_FRONTEND_DOMAIN);
        HttpSecurity http = Mockito.mock(HttpSecurity.class, Mockito.RETURNS_DEEP_STUBS);
        assertThat(config.securityFilterChain(http)).isNotNull();
    }

    @Test
    void corsConfigurationSourceBeanIsCreated() {
        OAuth2LoginSuccessHandler successHandler = Mockito.mock(OAuth2LoginSuccessHandler.class);
        ClientRegistrationRepository clientRegistrationRepository = Mockito.mock(ClientRegistrationRepository.class);
        SecurityConfig config = new SecurityConfig(successHandler, clientRegistrationRepository, TEST_GATEWAY_SECRET,
                TEST_FRONTEND_DOMAIN);
        CorsConfigurationSource source = config.corsConfigurationSource();
        assertThat(source).isNotNull();
    }
}
