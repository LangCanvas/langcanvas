
export class DoNotTrackDetector {
  static isDoNotTrackEnabled(): boolean {
    // Check multiple DNT indicators for better compatibility
    const dnt = navigator.doNotTrack || 
               (window as any).doNotTrack || 
               (navigator as any).msDoNotTrack;
    
    // DNT can be "1", "yes", or true for enabled
    return dnt === "1" || dnt === "yes" || dnt === true;
  }

  static shouldRespectPrivacy(): boolean {
    // Also check for Global Privacy Control (GPC)
    const gpc = (navigator as any).globalPrivacyControl;
    return this.isDoNotTrackEnabled() || gpc === true;
  }

  static getPrivacySignals(): {
    doNotTrack: boolean;
    globalPrivacyControl: boolean;
    shouldDisableTracking: boolean;
  } {
    const doNotTrack = this.isDoNotTrackEnabled();
    const globalPrivacyControl = (navigator as any).globalPrivacyControl === true;
    
    return {
      doNotTrack,
      globalPrivacyControl,
      shouldDisableTracking: doNotTrack || globalPrivacyControl
    };
  }
}
