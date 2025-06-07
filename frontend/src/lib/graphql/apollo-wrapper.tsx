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

async function refreshAccessToken(client: ApolloClient<unknown>) {
    const response = await client.mutate({ mutation: RefreshDocument });
    const responseSchema = z.object({
        data: z.object({
            refresh: z.object({
                message: z.enum([
                    'Invalid refresh token',
                    'Access token refreshed',
                ]),
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
            });
            return response;
        }),
    );

    const httpLink = new HttpLink({
        uri: 'http://localhost:4000/graphql',
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

export function ApolloWrapper({ children }: React.PropsWithChildren) {
    return (
        <ApolloNextAppProvider makeClient={makeClient}>
            {children}
        </ApolloNextAppProvider>
    );
}
