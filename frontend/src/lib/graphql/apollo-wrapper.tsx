'use client';

import { RefreshDocument } from '@/generated/graphql';
import { ApolloLink, HttpLink, from } from '@apollo/client';
import {
    ApolloClient,
    ApolloNextAppProvider,
    InMemoryCache,
} from '@apollo/client-integration-nextjs';
import { onError } from '@apollo/client/link/error';
import { triggerAuthFailure } from '../events/auth';
import { useRefetchStore } from '../stores/use-refetch-store';

function makeClient() {
    const httpLink = new HttpLink({
        uri: 'http://localhost:4000/graphql',
        credentials: 'include',
    });

    const errorLink = onError(
        ({ graphQLErrors, networkError, protocolErrors }) => {
            if (graphQLErrors)
                graphQLErrors.forEach(({ message }) => {
                    console.log(`[GraphQL error]: Message: ${message}`);

                    if (message === 'Invalid access token') {
                        const client = new ApolloClient({
                            cache: new InMemoryCache(),
                            link: httpLink,
                        });

                        client
                            .mutate({
                                mutation: RefreshDocument,
                            })
                            .then((response) => {
                                if (response.data?.refresh) {
                                    console.log(
                                        'Access token refreshed successfully',
                                    );

                                    useRefetchStore
                                        .getState()
                                        .triggerRefetch('me');
                                } else {
                                    console.error(
                                        'Failed to refresh access token',
                                    );
                                }
                            })
                            .catch((error: unknown) => {
                                console.error(
                                    'Error refreshing access token:',
                                    error,
                                );
                                triggerAuthFailure();
                            });
                    }
                });

            if (protocolErrors) {
                protocolErrors.forEach(({ message, extensions }) => {
                    console.log(
                        `[Protocol error]: Message: ${message}, Extensions: ${JSON.stringify(extensions)}`,
                    );
                });
            }

            if (networkError) console.log(`[Network error]: ${networkError}`);
        },
    );

    const loggingLink = new ApolloLink((operation, forward) => {
        return forward(operation).map((response) => {
            console.log('[GraphQL response]:', {
                operationName: operation.operationName,
                variables: operation.variables,
                data: response.data,
            });
            return response;
        });
    });

    return new ApolloClient({
        cache: new InMemoryCache(),
        link: from([errorLink, loggingLink, httpLink]),
    });
}

export function ApolloWrapper({ children }: React.PropsWithChildren) {
    return (
        <ApolloNextAppProvider makeClient={makeClient}>
            {children}
        </ApolloNextAppProvider>
    );
}
