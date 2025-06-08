
import { GoogleAuthInitializer } from './auth/googleAuthInitializer';
import { GoogleAuthOperations } from './auth/googleAuthOperations';
import { AuthErrorHandler } from './auth/googleAuthConfig';

export * from './auth/googleAuthConfig';

export class GoogleAuthService {
  static async initialize(callbackHandler?: (response: any) => void): Promise<void> {
    return GoogleAuthInitializer.initialize(callbackHandler);
  }

  static enableFallbackMode(): void {
    GoogleAuthInitializer.enableFallbackMode();
  }

  static async promptSignIn(): Promise<void> {
    return GoogleAuthOperations.promptSignIn();
  }

  static async renderButton(container: HTMLElement, customCallback?: (response: any) => void): Promise<void> {
    return GoogleAuthOperations.renderButton(container, customCallback);
  }

  static parseCredential(credential: string) {
    return GoogleAuthOperations.parseCredential(credential);
  }

  static disableAutoSelect(): void {
    GoogleAuthOperations.disableAutoSelect();
  }

  static getDiagnosticInfo(): Record<string, any> {
    return {
      isInitialized: GoogleAuthInitializer.initialized,
      ...AuthErrorHandler.getDiagnosticInfo()
    };
  }

  static getRequiredDomainConfig() {
    return AuthErrorHandler.getRequiredDomainConfig();
  }
}
