import { render, screen } from '@testing-library/react';
import { describe, expect, it, Mock, vi } from 'vitest';
import WelcomeMessage from './WelcomeMessage';

vi.mock('@/generated/graphql', () => ({
    useMeQuery: vi.fn(),
}));

vi.mock('@/lib/stores/use-refetch-store', () => ({
    useRefetchStore: vi.fn(() => () => {
        return;
    }),
}));

import { useMeQuery } from '@/generated/graphql';

describe('WelcomeMessage', () => {
    it('renders loading skeletons when loading', () => {
        (useMeQuery as Mock).mockReturnValue({
            data: null,
            loading: true,
            error: null,
            refetch: vi.fn(),
        });

        render(<WelcomeMessage />);
        expect(screen.getByTestId('skeleton-title')).toBeInTheDocument();
        expect(screen.getByTestId('skeleton-subtitle')).toBeInTheDocument();
    });

    it('renders error message when error occurs', () => {
        (useMeQuery as Mock).mockReturnValue({
            data: null,
            loading: false,
            error: { message: 'Something went wrong' },
            refetch: vi.fn(),
        });

        render(<WelcomeMessage />);
        expect(screen.getByText(/error/i)).toBeInTheDocument();
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('renders dashboard with user name when AuthPayload is returned', () => {
        (useMeQuery as Mock).mockReturnValue({
            data: {
                me: {
                    __typename: 'AuthPayload',
                    name: 'Alice',
                    email: 'alice@example.com',
                },
            },
            loading: false,
            error: null,
            refetch: vi.fn(),
        });

        render(<WelcomeMessage />);
        expect(
            screen.getByText(/welcome to the dashboard alice/i),
        ).toBeInTheDocument();
    });

    it('renders dashboard with email if name is missing', () => {
        (useMeQuery as Mock).mockReturnValue({
            data: {
                me: {
                    __typename: 'AuthPayload',
                    name: null,
                    email: 'bob@example.com',
                },
            },
            loading: false,
            error: null,
            refetch: vi.fn(),
        });

        render(<WelcomeMessage />);
        expect(
            screen.getByText(/welcome to the dashboard bob@example.com/i),
        ).toBeInTheDocument();
    });
});
