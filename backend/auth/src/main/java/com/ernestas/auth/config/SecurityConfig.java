package com.ernestas.auth.config;

import com.ernestas.auth.security.CustomOAuth2AuthorizationRequestResolver;
import com.ernestas.auth.security.OAuth2LoginSuccessHandler;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Security configuration class.
 */
@Configuration
public class SecurityConfig {
    private final OAuth2LoginSuccessHandler successHandler;
    private final ClientRegistrationRepository clientRegistrationRepository;

    /**
     * Constructor for SecurityConfig.
     *
     * @param successHandler the OAuth2LoginSuccessHandler instance for handling successful logins
     * @param clientRegistrationRepository the ClientRegistrationRepository instance for managing
     *                                     OAuth2 client registrations
     */
    public SecurityConfig(
        OAuth2LoginSuccessHandler successHandler,
        ClientRegistrationRepository clientRegistrationRepository
    ) {
        this.successHandler = successHandler;
        this.clientRegistrationRepository = clientRegistrationRepository;
    }

    /**
     * Configures the security filter chain for the application.
     *
     * <p>This method sets up the security configuration using {@link HttpSecurity}.
     * It ensures that all incoming requests are authenticated and enables OAuth2 login
     * with default settings. It also configures the authorization endpoint to use a custom
     * request resolver for handling authorization requests.</p>
     *
     * @param http the {@link HttpSecurity} object used to configure security settings
     * @return the configured {@link SecurityFilterChain} instance
     * @throws Exception if an error occurs while building the security configuration
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(authorizeRequests -> authorizeRequests
                .anyRequest().permitAll()
            )
            .oauth2Login(oauth2Login -> oauth2Login
                .authorizationEndpoint(authEndpoint -> authEndpoint
                    .authorizationRequestResolver(
                        new CustomOAuth2AuthorizationRequestResolver(clientRegistrationRepository))
                    )
                .successHandler(successHandler)
            );

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));
        configuration.setAllowedMethods(List.of("*"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
