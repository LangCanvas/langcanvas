
export class DebugLogger {
  private logs: string[] = [];
  private maxLogs = 10;

  addLog(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    const newLog = `[${timestamp}] ${message}`;
    console.log('🔐 DEBUG:', newLog);
    this.logs = [...this.logs.slice(-(this.maxLogs - 1)), newLog];
  }

  getLogs(): string[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }
}
