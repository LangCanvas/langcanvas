
import { useAuthHandlers } from '@/hooks/useAuthHandlers';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { useSignInOperations } from '@/hooks/auth/useSignInOperations';
import { useButtonSignIn } from '@/hooks/auth/useButtonSignIn';
import { useSignOutOperations } from '@/hooks/auth/useSignOutOperations';

export const useAuthOperations = (
  isGoogleLoaded: boolean,
  authHandlers: ReturnType<typeof useAuthHandlers>,
  initializeAuth: () => Promise<void>,
  secureAuth: ReturnType<typeof useSecureAuth>
) => {
  const { signIn } = useSignInOperations(isGoogleLoaded, authHandlers, initializeAuth);
  const { signInWithButton } = useButtonSignIn(authHandlers);
  const { signOut, clearError, clearCache } = useSignOutOperations(authHandlers, secureAuth, initializeAuth);

  return {
    signIn,
    signInWithButton,
    signOut,
    clearError,
    clearCache
  };
};
