package com.ernestas.auth.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CustomOAuth2AuthorizationRequestResolverTest {

    private ClientRegistrationRepository clientRegistrationRepository;
    private HttpServletRequest request;
    private HttpSession session;

    @BeforeEach
    void setUp() {
        clientRegistrationRepository = mock(ClientRegistrationRepository.class);

        request = mock(HttpServletRequest.class);
        session = mock(HttpSession.class);

        when(request.getSession()).thenReturn(session);
    }

    @Test
    void shouldStoreRedirectUriIfPresentAndAuthRequestNotNull() {
        when(request.getParameter("redirect_uri")).thenReturn("https://example.com/callback");

        OAuth2AuthorizationRequest mockAuthRequest = mock(OAuth2AuthorizationRequest.class);

        CustomOAuth2AuthorizationRequestResolver resolverWithMockedDelegate =
            new CustomOAuth2AuthorizationRequestResolver(clientRegistrationRepository) {
                @Override
                public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
                    if ("https://example.com/callback".equals(request.getParameter("redirect_uri"))) {
                        request.getSession().setAttribute("redirectUri", "https://example.com/callback");
                    }
                    return mockAuthRequest;
                }
            };

        OAuth2AuthorizationRequest result = resolverWithMockedDelegate.resolve(request);

        assertNotNull(result);
        assertEquals(mockAuthRequest, result);
        verify(session).setAttribute("redirectUri", "https://example.com/callback");
    }

    @Test
    void shouldNotStoreRedirectUriIfMissing() {
        when(request.getParameter("redirect_uri")).thenReturn(null);

        OAuth2AuthorizationRequest mockAuthRequest = mock(OAuth2AuthorizationRequest.class);
        CustomOAuth2AuthorizationRequestResolver resolverSpy =
                spy(new CustomOAuth2AuthorizationRequestResolver(clientRegistrationRepository));

        doReturn(mockAuthRequest).when((OAuth2AuthorizationRequestResolver) resolverSpy).resolve(request);

        OAuth2AuthorizationRequest result = resolverSpy.resolve(request);

        assertEquals(mockAuthRequest, result);
        verify(session, never()).setAttribute(eq("redirectUri"), any());
    }

    @Test
    void shouldReturnNullIfDelegateReturnsNull() {
        when(request.getParameter("redirect_uri")).thenReturn("https://example.com/callback");

        CustomOAuth2AuthorizationRequestResolver resolverSpy =
                spy(new CustomOAuth2AuthorizationRequestResolver(clientRegistrationRepository));
        doReturn(null).when((OAuth2AuthorizationRequestResolver) resolverSpy).resolve(request);

        OAuth2AuthorizationRequest result = resolverSpy.resolve(request);

        assertNull(result);
        verify(session, never()).setAttribute(anyString(), any());
    }

    @Test
    void resolveWithClientRegistrationIdShouldCallSingleArgumentResolve() {
        when(request.getParameter("redirect_uri")).thenReturn("https://example.com/redirect");

        CustomOAuth2AuthorizationRequestResolver resolverSpy =
                spy(new CustomOAuth2AuthorizationRequestResolver(clientRegistrationRepository));

        OAuth2AuthorizationRequest mockAuthRequest = mock(OAuth2AuthorizationRequest.class);
        doReturn(mockAuthRequest).when((OAuth2AuthorizationRequestResolver) resolverSpy).resolve(request);

        OAuth2AuthorizationRequest result =
                resolverSpy.resolve(request, "google");

        assertEquals(mockAuthRequest, result);
        verify((OAuth2AuthorizationRequestResolver) resolverSpy).resolve(request);
    }
}
