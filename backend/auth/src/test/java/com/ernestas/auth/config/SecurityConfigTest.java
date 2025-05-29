package com.ernestas.auth.config;

import com.ernestas.auth.security.OAuth2LoginSuccessHandler;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.web.cors.CorsConfigurationSource;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class SecurityConfigTest {

    @Test
    void securityFilterChainBeanIsCreated() throws Exception {
        OAuth2LoginSuccessHandler successHandler = Mockito.mock(OAuth2LoginSuccessHandler.class);
        ClientRegistrationRepository clientRegistrationRepository = Mockito.mock(ClientRegistrationRepository.class);
        SecurityConfig config = new SecurityConfig(successHandler, clientRegistrationRepository);
        HttpSecurity http = Mockito.mock(HttpSecurity.class, Mockito.RETURNS_DEEP_STUBS);
        assertThat(config.securityFilterChain(http)).isNotNull();
    }

    @Test
    void corsConfigurationSourceBeanIsCreated() {
        OAuth2LoginSuccessHandler successHandler = Mockito.mock(OAuth2LoginSuccessHandler.class);
        ClientRegistrationRepository clientRegistrationRepository = Mockito.mock(ClientRegistrationRepository.class);
        SecurityConfig config = new SecurityConfig(successHandler, clientRegistrationRepository);
        CorsConfigurationSource source = config.corsConfigurationSource();
        assertThat(source).isNotNull();
    }
}

