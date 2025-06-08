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
     * Initializes the SecurityConfig with required handlers, repository, and
     * configuration properties.
     *
     * @param successHandler               the handler for successful OAuth2 logins
     * @param clientRegistrationRepository the repository for OAuth2 client
     *                                     registrations
     * @param gatewaySecret                the secret value used for gateway
     *                                     authentication
     * @param frontendDomain               the allowed frontend domain for CORS
     *                                     configuration
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
     * Builds and configures the application's security filter chain.
     *
     * <p>
     * Sets up CORS, CSRF protection (excluding /health and /graphql), stateless
     * session management,
     * and a custom gateway authentication filter. Permits all HTTP requests and
     * configures OAuth2
     * login with a custom authorization request resolver and success handler.
     * </p>
     *
     *
     * @param http the {@link HttpSecurity} object for configuring security settings
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
     * Creates a CORS configuration source that permits requests only from the
     * configured frontend domain.
     *
     * <p>
     * Allows all HTTP methods and headers, and enables credentials for cross-origin
     * requests.
     * </p>
     *
     * @return a CorsConfigurationSource allowing CORS requests from the specified
     *         frontend domain
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
     * Returns a filter that enforces the presence of a valid gateway secret in the
     * `x-gateway-secret`
     * request header for all endpoints except `/health`.
     *
     * <p>
     * Requests missing the correct secret receive a 403 Forbidden response and are
     * not processed further.
     * </p>
     *
     * @return a {@link OncePerRequestFilter} that validates the gateway secret
     *         header
     */
    @Bean
    OncePerRequestFilter gatewayAuthFilter() {
        return new OncePerRequestFilter() {
            /****
             * Checks the `x-gateway-secret` header on incoming requests and blocks access
             * with HTTP 403
             * Forbidden if the secret is missing or incorrect, except for requests to the
             * `/health` endpoint.
             *
             * @param request     the HTTP request
             * @param response    the HTTP response
             * @param filterChain the filter chain to continue processing if the secret is
             *                    valid or the
             *                    request is for `/health`
             * @throws ServletException if a servlet error occurs
             * @throws IOException      if an I/O error occurs
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
