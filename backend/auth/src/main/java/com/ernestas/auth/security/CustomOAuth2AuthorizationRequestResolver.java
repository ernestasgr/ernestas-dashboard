package com.ernestas.auth.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;

/**
 * Custom OAuth2AuthorizationRequestResolver that handles the authorization request
 * and stores the redirect URI in the session.
 */
@SuppressWarnings("checkstyle:AbbreviationAsWordInName")
public class CustomOAuth2AuthorizationRequestResolver
        implements OAuth2AuthorizationRequestResolver {

    private final OAuth2AuthorizationRequestResolver delegate;

    /**
     * Constructor for CustomOAuth2AuthorizationRequestResolver.
     *
     * @param clientRegistrationRepository the ClientRegistrationRepository instance
     *                                     for managing client registrations
     */
    public CustomOAuth2AuthorizationRequestResolver(
            ClientRegistrationRepository clientRegistrationRepository
    ) {
        this.delegate = new DefaultOAuth2AuthorizationRequestResolver(
                clientRegistrationRepository,
                "/oauth2/authorization"
        );
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
        OAuth2AuthorizationRequest authorizationRequest = delegate.resolve(request);

        String redirectUri = request.getParameter("redirect_uri");
        if (redirectUri != null && authorizationRequest != null) {
            request.getSession().setAttribute("redirectUri", redirectUri);
        }

        return authorizationRequest;
    }

    @Override
    public OAuth2AuthorizationRequest resolve(
            HttpServletRequest request, String clientRegistrationId
    ) {
        return resolve(request);
    }
}
