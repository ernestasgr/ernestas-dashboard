'use client';

import { RefreshDocument } from '@/generated/graphql';
import { ApolloLink, HttpLink, Observable, from } from '@apollo/client';
import {
    ApolloClient,
    ApolloNextAppProvider,
    InMemoryCache,
} from '@apollo/client-integration-nextjs';
import { onError } from '@apollo/client/link/error';
import { z } from 'zod';
import { triggerAuthFailure } from '../events/auth';
import { useEventStore } from '../stores/use-event-store';
import { getCsrfToken } from '../utils/auth-utils';
import { env } from '../utils/env-utils';

/**
 * Attempts to refresh the user's access token using a GraphQL mutation.
 *
 * Sends a refresh token mutation via the provided Apollo Client and validates the response. If the access token is successfully refreshed, triggers a global 'refresh' event and returns `true`.
 *
 * @returns `true` if the access token was refreshed successfully.
 *
 * @throws {Error} If the refresh mutation fails or the response does not indicate a successful token refresh.
 */
async function refreshAccessToken(client: ApolloClient<unknown>) {
    const response = await client.mutate({ mutation: RefreshDocument });
    const responseSchema = z.object({
        data: z.object({
            refresh: z.object({
                message: z.string(),
            }),
        }),
    });
    const parsed = responseSchema.safeParse(response);
    if (
        parsed.success &&
        parsed.data.data.refresh.message === 'Access token refreshed'
    ) {
        console.log('Access token refreshed successfully');
        useEventStore.getState().trigger('refresh');
        return true;
    }
    throw new Error('Failed to refresh access token');
}

/**
 * Creates and configures an Apollo Client instance with error handling, token refresh, logging, and CSRF protection.
 *
 * The client automatically attempts to refresh the access token and retry operations when authentication errors occur. All GraphQL responses are logged, and requests include a CSRF token header.
 *
 * @returns An Apollo Client instance ready for use in a Next.js application.
 */
function makeClient() {
    // eslint-disable-next-line prefer-const
    let client: ApolloClient<unknown>;

    const errorLink = onError(
        ({ graphQLErrors, networkError, operation, forward }) => {
            if (graphQLErrors) {
                for (const err of graphQLErrors) {
                    console.log(`[GraphQL error]: Message: ${err.message}`);

                    if (err.message === 'Invalid access token') {
                        return new Observable((observer) => {
                            refreshAccessToken(client)
                                .then(() => {
                                    const forwardObserver = {
                                        next: observer.next.bind(observer),
                                        error: observer.error.bind(observer),
                                        complete:
                                            observer.complete.bind(observer),
                                    };
                                    forward(operation).subscribe(
                                        forwardObserver,
                                    );
                                })
                                .catch((error: unknown) => {
                                    console.error(
                                        'Error refreshing access token:',
                                        error,
                                    );
                                    triggerAuthFailure();
                                    observer.error(error);
                                });
                        });
                    }
                }
            }

            if (networkError) {
                console.log(`[Network error]: ${networkError}`);
            }
        },
    );

    const loggingLink = new ApolloLink((operation, forward) =>
        forward(operation).map((response) => {
            console.log('[GraphQL response]:', {
                operationName: operation.operationName,
                variables: operation.variables,
                data: response.data,
            }); // TODO: Scrub sensitive data in production
            return response;
        }),
    );

    const httpLink = new HttpLink({
        uri: `${env.NEXT_PUBLIC_GATEWAY_DOMAIN}/graphql`,
        credentials: 'include',
        headers: {
            'X-XSRF-TOKEN': getCsrfToken(),
        },
    });

    client = new ApolloClient({
        cache: new InMemoryCache(),
        link: from([errorLink, loggingLink, httpLink]),
    });

    return client;
}

/**
 * Provides the Apollo Client context to its child components for GraphQL operations.
 *
 * Wraps children with {@link ApolloNextAppProvider}, supplying a preconfigured Apollo Client instance for use within a Next.js application.
 *
 * @param children - React components that require access to the Apollo Client context.
 */
export function ApolloWrapper({ children }: React.PropsWithChildren) {
    return (
        <ApolloNextAppProvider makeClient={makeClient}>
            {children}
        </ApolloNextAppProvider>
    );
}
