package com.ernestas.auth.service;

import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

/**
 * Service for handling GitHub-specific OAuth2 user information retrieval.
 * GitHub OAuth2 implementation requires separate API calls to get user email
 * addresses.
 */
@Service
public class GitHubOAuth2UserService {

    private static final Logger logger = LoggerFactory.getLogger(GitHubOAuth2UserService.class);
    private static final String GITHUB_API_USER_URL = "https://api.github.com/user";
    private static final String GITHUB_API_EMAILS_URL = "https://api.github.com/user/emails";

    private final RestTemplate restTemplate;

    /**
     * Constructor for GitHubOAuth2UserService.
     *
     * @param restTemplate the RestTemplate for making HTTP requests
     */
    public GitHubOAuth2UserService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Enhances the OAuth2User with GitHub-specific user information including
     * email.
     * For GitHub OAuth2, the email is not included in the standard user attributes
     * and must be fetched separately from the GitHub API.
     *
     * @param oauth2User  the OAuth2User from the authentication flow
     * @param accessToken the OAuth2 access token for API calls
     * @return enhanced OAuth2User with email information
     * @throws RuntimeException if unable to fetch user information from GitHub API
     */
    public OAuth2User enhanceGitHubUser(OAuth2User oauth2User, String accessToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "token " + accessToken);
            headers.set("Accept", "application/vnd.github.v3+json");
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<Map<String, Object>> userResponse = restTemplate.exchange(
                    GITHUB_API_USER_URL,
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<Map<String, Object>>() {
                    });

            ResponseEntity<List<Map<String, Object>>> emailsResponse = restTemplate.exchange(
                    GITHUB_API_EMAILS_URL,
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {
                    });

            if (userResponse.getStatusCode().is2xxSuccessful() &&
                    emailsResponse.getStatusCode().is2xxSuccessful()) {

                Map<String, Object> userInfo = userResponse.getBody();
                List<Map<String, Object>> emails = emailsResponse.getBody();

                if (userInfo == null || emails == null) {
                    logger.error("Received null response from GitHub API");
                    throw new RuntimeException("Received null response from GitHub API");
                }

                String primaryEmail = findPrimaryEmail(emails);

                if (primaryEmail == null) {
                    logger.error("No primary email found for GitHub user");
                    throw new RuntimeException("No primary email found for GitHub user");
                }

                Map<String, Object> enhancedAttributes = Map.of(
                        "email", primaryEmail,
                        "name", userInfo.getOrDefault("name", userInfo.get("login")),
                        "login", userInfo.get("login"),
                        "id", userInfo.get("id"));

                logger.info("Successfully enhanced GitHub user with email: {}", primaryEmail);

                return new EnhancedOAuth2User(oauth2User, enhancedAttributes);
            } else {
                logger.error("Failed to fetch user information from GitHub API. User response: {}, Emails response: {}",
                        userResponse.getStatusCode(), emailsResponse.getStatusCode());
                throw new RuntimeException("Failed to fetch user information from GitHub API");
            }

        } catch (RestClientException e) {
            logger.error("Error calling GitHub API", e);
            throw new RuntimeException("Error calling GitHub API", e);
        }
    }

    /**
     * Finds the primary email address from the list of user emails.
     * Prioritizes the primary email, falls back to the first verified email,
     * and finally to the first email if no verified emails are found.
     *
     * @param emails list of email objects from GitHub API
     * @return the primary email address, or null if no suitable email is found
     */
    private String findPrimaryEmail(List<Map<String, Object>> emails) {
        if (emails == null || emails.isEmpty()) {
            return null;
        }

        // First, try to find the primary email
        for (Map<String, Object> email : emails) {
            Boolean isPrimary = (Boolean) email.get("primary");
            if (Boolean.TRUE.equals(isPrimary)) {
                return (String) email.get("email");
            }
        }

        // If no primary email, find the first verified email
        for (Map<String, Object> email : emails) {
            Boolean isVerified = (Boolean) email.get("verified");
            if (Boolean.TRUE.equals(isVerified)) {
                return (String) email.get("email");
            }
        }

        // Fall back to the first email
        return (String) emails.get(0).get("email");
    }

    /**
     * Custom implementation of OAuth2User that allows enhancing attributes.
     */
    private static class EnhancedOAuth2User implements OAuth2User {
        private final OAuth2User original;
        private final Map<String, Object> enhancedAttributes;

        public EnhancedOAuth2User(OAuth2User original, Map<String, Object> enhancedAttributes) {
            this.original = original;
            this.enhancedAttributes = enhancedAttributes;
        }

        @Override
        public Map<String, Object> getAttributes() {
            return enhancedAttributes;
        }

        @Override
        public Collection<? extends GrantedAuthority> getAuthorities() {
            return original.getAuthorities();
        }

        @Override
        public String getName() {
            return (String) enhancedAttributes.get("name");
        }

        @Override
        @SuppressWarnings("unchecked")
        public <A> A getAttribute(String name) {
            return (A) enhancedAttributes.get(name);
        }
    }
}
