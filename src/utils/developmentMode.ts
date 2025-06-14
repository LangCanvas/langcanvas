
import { isDevelopment } from '@/config/firebase';

export class DevelopmentModeManager {
  static isDevelopment(): boolean {
    return isDevelopment;
  }

  static shouldSkipFirestore(): boolean {
    return this.isDevelopment();
  }

  static logFirestoreSkip(operation: string): void {
    if (this.isDevelopment()) {
      console.log(`🔧 Firestore ${operation} skipped in development environment`);
    }
  }
}
