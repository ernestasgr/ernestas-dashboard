'use client';

import { HttpLink, from } from '@apollo/client';
import {
    ApolloClient,
    ApolloNextAppProvider,
    InMemoryCache,
} from '@apollo/client-integration-nextjs';
import { onError } from '@apollo/client/link/error';

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

    return new ApolloClient({
        cache: new InMemoryCache(),
        link: from([errorLink, httpLink]),
    });
}

export function ApolloWrapper({ children }: React.PropsWithChildren) {
    return (
        <ApolloNextAppProvider makeClient={makeClient}>
            {children}
        </ApolloNextAppProvider>
    );
}
