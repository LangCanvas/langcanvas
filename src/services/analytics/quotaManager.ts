
export class QuotaManager {
  private quotaExhausted: boolean = false;
  private lastQuotaError: number = 0;
  private retryDelay: number = 60000; // Start with 1 minute delay

  isQuotaError(error: any): boolean {
    return error?.code === 'resource-exhausted' || 
           error?.message?.includes('Quota exceeded') ||
           error?.message?.includes('resource-exhausted');
  }

  handleQuotaError(): void {
    this.quotaExhausted = true;
    this.lastQuotaError = Date.now();
    // Exponential backoff: double the delay each time, max 1 hour
    this.retryDelay = Math.min(this.retryDelay * 2, 3600000);
    console.warn(`🔥 Firestore quota exhausted. Will retry in ${this.retryDelay / 1000} seconds`);
  }

  canRetryFirestore(): boolean {
    if (!this.quotaExhausted) return true;
    
    const timeSinceError = Date.now() - this.lastQuotaError;
    if (timeSinceError > this.retryDelay) {
      this.quotaExhausted = false;
      return true;
    }
    return false;
  }

  reset(): void {
    this.quotaExhausted = false;
    this.lastQuotaError = 0;
    this.retryDelay = 60000;
  }
}
