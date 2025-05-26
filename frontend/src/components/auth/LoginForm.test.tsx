import { OAUTH_PROVIDERS } from '@/lib/constants/oauth-providers';
import { redirectToProviderLogin } from '@/lib/utils/auth-utils';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import LoginForm from './LoginForm';

vi.mock('@/lib/utils/auth-utils', () => ({
    redirectToProviderLogin: vi.fn(),
}));

describe('LoginForm', () => {
    it('renders login buttons for all providers', () => {
        render(<LoginForm />);
        Object.values(OAUTH_PROVIDERS).forEach((provider) => {
            expect(
                screen.getByText(
                    `Login with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`,
                ),
            ).toBeInTheDocument();
        });
    });

    it('calls redirectToProviderLogin with the correct provider when a button is clicked', () => {
        render(<LoginForm />);
        const googleButton = screen.getByText('Login with Google');
        fireEvent.click(googleButton);
        expect(redirectToProviderLogin).toHaveBeenCalledWith(
            OAUTH_PROVIDERS.GOOGLE,
        );
    });

    it('disables all buttons when a login is in progress', () => {
        render(<LoginForm />);
        const googleButton = screen.getByText('Login with Google');
        fireEvent.click(googleButton);

        Object.values(OAUTH_PROVIDERS).forEach((provider) => {
            const button = screen.getByText(
                provider === OAUTH_PROVIDERS.GOOGLE
                    ? 'Redirecting...'
                    : `Login with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`,
            );
            expect(button).toBeDisabled();
        });
    });

    it('shows "Redirecting..." text on the button when clicked', () => {
        render(<LoginForm />);
        const googleButton = screen.getByText('Login with Google');
        fireEvent.click(googleButton);
        expect(screen.getByText('Redirecting...')).toBeInTheDocument();
    });
});
