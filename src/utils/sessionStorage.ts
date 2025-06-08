
export class SessionStorageManager {
  private static readonly LOCK_TIMEOUT = 5000; // 5 seconds
  private static readonly STORAGE_LOCK_KEY = 'langcanvas_storage_lock';

  static async acquireStorageLock(): Promise<boolean> {
    const lockKey = this.STORAGE_LOCK_KEY;
    const lockTimeout = Date.now() + this.LOCK_TIMEOUT;
    
    try {
      const existingLock = localStorage.getItem(lockKey);
      if (existingLock && parseInt(existingLock) > Date.now()) {
        return false;
      }
      
      localStorage.setItem(lockKey, lockTimeout.toString());
      return true;
    } catch {
      return false;
    }
  }

  static releaseStorageLock(): void {
    try {
      localStorage.removeItem(this.STORAGE_LOCK_KEY);
    } catch {
      // Ignore errors during cleanup
    }
  }

  static async withLock<T>(operation: () => Promise<T> | T): Promise<T | null> {
    if (!await this.acquireStorageLock()) {
      return null;
    }

    try {
      return await operation();
    } finally {
      this.releaseStorageLock();
    }
  }
}
