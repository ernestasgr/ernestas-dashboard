package com.ernestas.auth.config;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.OncePerRequestFilter;

import com.ernestas.auth.security.CustomOAuth2AuthorizationRequestResolver;
import com.ernestas.auth.security.OAuth2LoginSuccessHandler;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Security configuration class.
 */
@Configuration
public class SecurityConfig {
    private final OAuth2LoginSuccessHandler successHandler;
    private final ClientRegistrationRepository clientRegistrationRepository;

    @Value("${gateway.secret}")
    private String gatewaySecret;

    @Value("${frontend.domain}")
    private String frontendDomain;

    /**
     * Constructor for SecurityConfig.
     *
     * @param successHandler               the OAuth2LoginSuccessHandler instance
     *                                     for handling successful logins
     * @param clientRegistrationRepository the ClientRegistrationRepository instance
     *                                     for managing
     *                                     OAuth2 client registrations
     */
    public SecurityConfig(
            OAuth2LoginSuccessHandler successHandler,
            ClientRegistrationRepository clientRegistrationRepository) {
        this.successHandler = successHandler;
        this.clientRegistrationRepository = clientRegistrationRepository;
    }

    /**
     * Configures the security filter chain for the application.
     *
     * <p>
     * This method sets up the security configuration using {@link HttpSecurity}.
     * It ensures that all incoming requests are authenticated and enables OAuth2
     * login
     * with default settings. It also configures the authorization endpoint to use a
     * custom
     * request resolver for handling authorization requests.
     * </p>
     *
     * @param http the {@link HttpSecurity} object used to configure security
     *             settings
     * @return the configured {@link SecurityFilterChain} instance
     * @throws Exception if an error occurs while building the security
     *                   configuration
     */
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf
                        .ignoringRequestMatchers("/health", "/graphql")
                        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                        .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler()))
                .addFilterBefore(gatewayAuthFilter(), UsernamePasswordAuthenticationFilter.class)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorizeRequests -> authorizeRequests
                        .anyRequest().permitAll())
                .oauth2Login(oauth2Login -> oauth2Login
                        .authorizationEndpoint(authEndpoint -> authEndpoint
                                .authorizationRequestResolver(
                                        new CustomOAuth2AuthorizationRequestResolver(
                                                clientRegistrationRepository)))
                        .successHandler(successHandler));

        return http.build();
    }

    /**
     * Configures CORS (Cross-Origin Resource Sharing) settings for the application.
     *
     * <p>
     * This method sets up a {@link CorsConfigurationSource} that allows requests
     * from the specified frontend domain,
     * allows all HTTP methods and headers, and enables credentials to be included
     * in
     * CORS requests.
     * </p>
     *
     * @return the configured {@link CorsConfigurationSource} instance
     */
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(frontendDomain));
        configuration.setAllowedMethods(List.of("*"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Creates a filter that checks for a gateway secret in the request header.
     *
     * <p>
     * This filter is used to protect certain endpoints from unauthorized access by
     * verifying the presence of a specific secret in the request header.
     * </p>
     *
     * @return an instance of {@link OncePerRequestFilter} that checks the gateway
     *         secret
     */
    @Bean
    OncePerRequestFilter gatewayAuthFilter() {
        return new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(@NonNull HttpServletRequest request,
                    @NonNull HttpServletResponse response,
                    @NonNull FilterChain filterChain)
                    throws ServletException, IOException {
                String secret = request.getHeader("x-gateway-secret");
                if (!"/health".equals(request.getRequestURI()) && !gatewaySecret.equals(secret)) {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    return;
                }
                filterChain.doFilter(request, response);
            }
        };
    }
}
