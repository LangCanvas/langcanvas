
import { GoogleAuthService } from '@/services/googleAuthService';
import { useAuthHandlers } from '@/hooks/useAuthHandlers';

export const useButtonSignIn = (authHandlers: ReturnType<typeof useAuthHandlers>) => {
  const { debugLogger, setAuthError, handleCredentialResponse } = authHandlers;

  const signInWithButton = async (): Promise<void> => {
    debugLogger.addLog('Starting alternative button-based enhanced sign-in...');
    setAuthError(null);
    
    try {
      const buttonContainer = document.createElement('div');
      buttonContainer.style.position = 'absolute';
      buttonContainer.style.top = '-9999px';
      buttonContainer.style.left = '-9999px';
      buttonContainer.style.width = '320px';
      buttonContainer.style.height = '60px';
      buttonContainer.style.zIndex = '9999';
      buttonContainer.id = 'temp-google-signin-button';
      document.body.appendChild(buttonContainer);

      // Render the button and wait for it to be ready
      await GoogleAuthService.renderButton(buttonContainer, handleCredentialResponse);
      
      debugLogger.addLog('Button rendered successfully, attempting to click...');
      
      // Find the button that was just rendered
      const buttonElement = buttonContainer.querySelector('div[role="button"]') as HTMLElement;
      
      if (!buttonElement) {
        throw new Error('Button element not found in container after successful rendering');
      }

      // Click the button directly
      buttonElement.click();
      
      debugLogger.addLog('Button clicked successfully');
      
      // Clean up the temporary container after a delay
      setTimeout(() => {
        if (document.body.contains(buttonContainer)) {
          document.body.removeChild(buttonContainer);
          debugLogger.addLog('Temporary button container cleaned up');
        }
      }, 8000);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Alternative sign-in failed';
      debugLogger.addLog(`Alternative sign-in failed: ${errorMessage}`);
      setAuthError({
        type: 'unknown',
        message: errorMessage,
        details: 'Button-based authentication attempt'
      });
      throw new Error(errorMessage);
    }
  };

  return { signInWithButton };
};
