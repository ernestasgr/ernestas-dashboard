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
    private final String gatewaySecret;
    private final String frontendDomain;

    /****
     * Constructs a SecurityConfig instance with the specified OAuth2 login success handler, client registration repository, gateway secret, and frontend domain.
     *
     * @param successHandler the handler to process successful OAuth2 logins
     * @param clientRegistrationRepository the repository containing OAuth2 client registrations
     * @param gatewaySecret the secret value required for gateway authentication
     * @param frontendDomain the domain allowed for CORS requests
     */
    public SecurityConfig(
            OAuth2LoginSuccessHandler successHandler,
            ClientRegistrationRepository clientRegistrationRepository,
            @Value("${gateway.secret}") String gatewaySecret,
            @Value("${frontend.domain}") String frontendDomain) {
        this.successHandler = successHandler;
        this.clientRegistrationRepository = clientRegistrationRepository;
        this.gatewaySecret = gatewaySecret;
        this.frontendDomain = frontendDomain;
    }

    /**
     * Configures and returns the application's security filter chain.
     *
     * <p>
     * Enables CORS, sets up CSRF protection (excluding the <code>/health</code> and <code>/graphql</code> endpoints), enforces stateless session management, and adds a custom gateway authentication filter. Permits all HTTP requests and configures OAuth2 login with a custom authorization request resolver and success handler.
     * </p>
     *
     * @param http the {@link HttpSecurity} to configure
     * @return the configured {@link SecurityFilterChain}
     * @throws Exception if an error occurs during security configuration
     */
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf
                        .ignoringRequestMatchers("/health", "/graphql")
                        .csrfTokenRepository(new CookieCsrfTokenRepository())
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

    /****
     * Creates a CORS configuration source that allows cross-origin requests only from the configured frontend domain.
     *
     * <p>
     * Permits all HTTP methods and headers, and enables credentials for cross-origin requests. The configuration applies to all URL paths.
     * </p>
     *
     * @return a CorsConfigurationSource permitting CORS requests from the specified frontend domain
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

    /****
     * Creates a filter that validates the `x-gateway-secret` header on incoming requests, blocking access with HTTP 403 Forbidden if the secret is missing or incorrect, except for requests to the `/health` endpoint.
     *
     * <p>
     * Only requests with the correct gateway secret header, or requests to `/health`, are allowed to proceed through the filter chain.
     * </p>
     *
     * @return a {@link OncePerRequestFilter} enforcing gateway secret validation
     */
    @Bean
    OncePerRequestFilter gatewayAuthFilter() {
        return new OncePerRequestFilter() {
            /****
             * Validates the `x-gateway-secret` header on incoming requests, allowing access only if the secret matches the configured value or the request is for the `/health` endpoint.
             *
             * Responds with HTTP 403 Forbidden if the secret is missing or incorrect for non-`/health` requests.
             *
             * @param request the HTTP request
             * @param response the HTTP response
             * @param filterChain the filter chain to continue processing if access is permitted
             * @throws ServletException if a servlet error occurs
             * @throws IOException if an I/O error occurs
             */
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
