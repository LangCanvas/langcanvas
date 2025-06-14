
export class DebugLogger {
  private logs: string[] = [];
  private maxLogs = 5; // Reduced from 10
  private isEnabled = process.env.NODE_ENV === 'development';

  addLog(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    if (!this.isEnabled) return;
    
    const timestamp = new Date().toLocaleTimeString();
    const emoji = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '🔍';
    const newLog = `[${timestamp}] ${message}`;
    
    // Only log errors and warnings to console, skip info in production-like scenarios
    if (level === 'error' || level === 'warn') {
      console.log(`${emoji} DEBUG:`, newLog);
    }
    
    this.logs = [...this.logs.slice(-(this.maxLogs - 1)), newLog];
  }

  addError(message: string): void {
    this.addLog(message, 'error');
  }

  addWarning(message: string): void {
    this.addLog(message, 'warn');
  }

  getLogs(): string[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  get enabled(): boolean {
    return this.isEnabled;
  }
}
