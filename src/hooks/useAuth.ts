import { authClient } from '../utils/auth-client';

/**
 * Authentication adapter hook
 * Provides a consistent interface for authentication operations
 * while leveraging Better Auth's native functionality
 */
export const useAuth = () => {
  const { data: session, isPending, error, refetch } = authClient.useSession();

  const login = async () => {
    return await authClient.signIn.social({
      provider: 'github',
      callbackURL: '/dash',
      errorCallbackURL: '/error',
      newUserCallbackURL: '/welcome',
      disableRedirect: false,
    });
  };

  const logout = async () => {
    return await authClient.signOut();
  };

  return {
    // Session state
    session,
    isAuthenticated: !!session,
    isLoading: isPending,
    error,

    // Actions
    login,
    logout,
    refetch,
  };
};
