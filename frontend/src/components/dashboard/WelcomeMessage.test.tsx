import { useUser } from '@/lib/hooks/use-user';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, Mock, vi } from 'vitest';
import WelcomeMessage from './WelcomeMessage';

vi.mock('@/lib/hooks/use-user', () => ({
    useUser: vi.fn(),
}));

describe('WelcomeMessage', () => {
    it('renders the welcome message when user data is available', () => {
        (useUser as Mock).mockReturnValue({
            data: { name: 'John Doe' },
            isLoading: false,
            isError: false,
        });

        render(<WelcomeMessage />);
        expect(
            screen.getByText(/welcome to the dashboard john doe/i),
        ).toBeInTheDocument();
    });

    it('renders loading skeletons when data is loading', () => {
        (useUser as Mock).mockReturnValue({
            data: null,
            isLoading: true,
            isError: false,
        });

        render(<WelcomeMessage />);
        expect(screen.getByTestId('skeleton-title')).toBeInTheDocument();
        expect(screen.getByTestId('skeleton-subtitle')).toBeInTheDocument();
    });

    it('renders an error message when there is an error', () => {
        (useUser as Mock).mockReturnValue({
            data: null,
            isLoading: false,
            isError: true,
        });

        render(<WelcomeMessage />);
        expect(
            screen.getByText(/error loading user data/i),
        ).toBeInTheDocument();
    });
});
