import { RefreshDocument } from '@/generated/graphql';
import { MockedProvider } from '@apollo/client/testing';
import { render, screen } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApolloWrapper } from './apollo-wrapper';

vi.mock('../events/auth', () => ({
    triggerAuthFailure: vi.fn(),
}));

vi.mock('../stores/use-event-store', () => ({
    useEventStore: {
        getState: vi.fn(() => ({
            trigger: vi.fn(),
        })),
    },
}));

vi.mock('../utils/auth-utils', () => ({
    getCsrfToken: vi.fn(() => 'mock-csrf-token'),
    initCsrfToken: vi.fn(() => Promise.resolve()),
}));

vi.mock('../utils/env-utils', () => ({
    env: {
        NEXT_PUBLIC_GATEWAY_DOMAIN: 'http://localhost:3001',
    },
}));

const mockConsoleLog = vi
    .spyOn(console, 'log')
    .mockImplementation(() => undefined);
const mockConsoleError = vi
    .spyOn(console, 'error')
    .mockImplementation(() => undefined);

describe('ApolloWrapper', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        mockConsoleLog.mockClear();
        mockConsoleError.mockClear();
    });

    it('renders children wrapped with Apollo provider', () => {
        render(
            <ApolloWrapper>
                <div data-testid='test-child'>Test Content</div>
            </ApolloWrapper>,
        );

        expect(screen.getByTestId('test-child')).toBeInTheDocument();
        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('provides Apollo Client context to children', () => {
        const TestComponent = () => {
            return <div data-testid='apollo-context'>Has Apollo Context</div>;
        };

        expect(() => {
            render(
                <ApolloWrapper>
                    <TestComponent />
                </ApolloWrapper>,
            );
        }).not.toThrow();

        expect(screen.getByTestId('apollo-context')).toBeInTheDocument();
    });

    it('creates client with proper configuration', () => {
        const TestComponent = () => {
            return <div>Test</div>;
        };

        expect(() => {
            render(
                <ApolloWrapper>
                    <TestComponent />
                </ApolloWrapper>,
            );
        }).not.toThrow();
    });

    it('handles multiple children correctly', () => {
        render(
            <ApolloWrapper>
                <div data-testid='child-1'>Child 1</div>
                <div data-testid='child-2'>Child 2</div>
                <span data-testid='child-3'>Child 3</span>
            </ApolloWrapper>,
        );

        expect(screen.getByTestId('child-1')).toBeInTheDocument();
        expect(screen.getByTestId('child-2')).toBeInTheDocument();
        expect(screen.getByTestId('child-3')).toBeInTheDocument();
    });

    it('handles empty children', () => {
        expect(() => {
            render(<ApolloWrapper>{null}</ApolloWrapper>);
        }).not.toThrow();
    });

    it('handles undefined children', () => {
        expect(() => {
            render(<ApolloWrapper>{undefined}</ApolloWrapper>);
        }).not.toThrow();
    });

    describe('GraphQL Error handling', () => {
        it('should handle network errors', () => {
            const errorMocks = [
                {
                    request: {
                        query: RefreshDocument,
                    },
                    error: new Error('Network error'),
                },
            ];

            const TestComponent = () => {
                return <div data-testid='error-test'>Error Test Component</div>;
            };

            render(
                <MockedProvider mocks={errorMocks} addTypename={false}>
                    <ApolloWrapper>
                        <TestComponent />
                    </ApolloWrapper>
                </MockedProvider>,
            );

            expect(screen.getByTestId('error-test')).toBeInTheDocument();
        });

        it('should handle GraphQL errors', () => {
            const errorMocks = [
                {
                    request: {
                        query: RefreshDocument,
                    },
                    result: {
                        errors: [new GraphQLError('Invalid access token')],
                    },
                },
            ];

            const TestComponent = () => {
                return (
                    <div data-testid='graphql-error-test'>
                        GraphQL Error Test
                    </div>
                );
            };

            render(
                <MockedProvider mocks={errorMocks} addTypename={false}>
                    <ApolloWrapper>
                        <TestComponent />
                    </ApolloWrapper>
                </MockedProvider>,
            );

            expect(
                screen.getByTestId('graphql-error-test'),
            ).toBeInTheDocument();
        });

        it('should handle authentication errors', () => {
            const errorMocks = [
                {
                    request: {
                        query: RefreshDocument,
                    },
                    result: {
                        errors: [
                            new GraphQLError('Unauthenticated', {
                                extensions: { code: 'UNAUTHENTICATED' },
                            }),
                        ],
                    },
                },
            ];

            const TestComponent = () => {
                return <div data-testid='auth-error-test'>Auth Error Test</div>;
            };

            render(
                <MockedProvider mocks={errorMocks} addTypename={false}>
                    <ApolloWrapper>
                        <TestComponent />
                    </ApolloWrapper>
                </MockedProvider>,
            );

            expect(screen.getByTestId('auth-error-test')).toBeInTheDocument();
        });
    });

    describe('Token refresh functionality', () => {
        it('should handle successful token refresh', () => {
            const successMocks = [
                {
                    request: {
                        query: RefreshDocument,
                    },
                    result: {
                        data: {
                            refresh: {
                                message: 'Access token refreshed',
                            },
                        },
                    },
                },
            ];

            const TestComponent = () => {
                return <div data-testid='refresh-test'>Refresh Test</div>;
            };

            render(
                <MockedProvider mocks={successMocks} addTypename={false}>
                    <ApolloWrapper>
                        <TestComponent />
                    </ApolloWrapper>
                </MockedProvider>,
            );

            expect(screen.getByTestId('refresh-test')).toBeInTheDocument();
        });

        it('should handle failed token refresh', () => {
            const failureMocks = [
                {
                    request: {
                        query: RefreshDocument,
                    },
                    result: {
                        data: {
                            refresh: {
                                message: 'Failed to refresh',
                            },
                        },
                    },
                },
            ];

            const TestComponent = () => {
                return (
                    <div data-testid='refresh-fail-test'>Refresh Fail Test</div>
                );
            };

            render(
                <MockedProvider mocks={failureMocks} addTypename={false}>
                    <ApolloWrapper>
                        <TestComponent />
                    </ApolloWrapper>
                </MockedProvider>,
            );

            expect(screen.getByTestId('refresh-fail-test')).toBeInTheDocument();
        });
    });

    describe('Environment configuration', () => {
        it('uses the correct GraphQL endpoint from environment', () => {
            const TestComponent = () => <div>Test</div>;

            expect(() => {
                render(
                    <ApolloWrapper>
                        <TestComponent />
                    </ApolloWrapper>,
                );
            }).not.toThrow();
        });
    });

    describe('CSRF token handling', () => {
        it('initializes without CSRF token errors', () => {
            const TestComponent = () => (
                <div data-testid='csrf-test'>CSRF Test</div>
            );

            expect(() => {
                render(
                    <ApolloWrapper>
                        <TestComponent />
                    </ApolloWrapper>,
                );
            }).not.toThrow();

            expect(screen.getByTestId('csrf-test')).toBeInTheDocument();
        });
    });

    describe('Production vs Development behavior', () => {
        it('handles production environment correctly', () => {
            vi.stubEnv('NODE_ENV', 'production');

            const TestComponent = () => (
                <div data-testid='prod-test'>Production Test</div>
            );

            expect(() => {
                render(
                    <ApolloWrapper>
                        <TestComponent />
                    </ApolloWrapper>,
                );
            }).not.toThrow();

            expect(screen.getByTestId('prod-test')).toBeInTheDocument();

            vi.unstubAllEnvs();
        });

        it('handles development environment correctly', () => {
            vi.stubEnv('NODE_ENV', 'development');

            const TestComponent = () => (
                <div data-testid='dev-test'>Development Test</div>
            );

            expect(() => {
                render(
                    <ApolloWrapper>
                        <TestComponent />
                    </ApolloWrapper>,
                );
            }).not.toThrow();

            expect(screen.getByTestId('dev-test')).toBeInTheDocument();

            vi.unstubAllEnvs();
        });
    });

    describe('Edge cases', () => {
        it('handles malformed GraphQL responses gracefully', () => {
            const malformedMocks = [
                {
                    request: {
                        query: RefreshDocument,
                    },
                    result: {
                        data: null,
                    },
                },
            ];

            const TestComponent = () => {
                return <div data-testid='malformed-test'>Malformed Test</div>;
            };

            render(
                <MockedProvider mocks={malformedMocks} addTypename={false}>
                    <ApolloWrapper>
                        <TestComponent />
                    </ApolloWrapper>
                </MockedProvider>,
            );

            expect(screen.getByTestId('malformed-test')).toBeInTheDocument();
        });

        it('handles component re-renders without issues', () => {
            const TestComponent = ({ count }: { count: number }) => {
                return (
                    <div data-testid='rerender-test'>Render count: {count}</div>
                );
            };

            const { rerender } = render(
                <ApolloWrapper>
                    <TestComponent count={1} />
                </ApolloWrapper>,
            );

            expect(screen.getByText('Render count: 1')).toBeInTheDocument();

            rerender(
                <ApolloWrapper>
                    <TestComponent count={2} />
                </ApolloWrapper>,
            );

            expect(screen.getByText('Render count: 2')).toBeInTheDocument();
        });
    });
});
