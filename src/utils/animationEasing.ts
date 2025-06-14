
export type EasingFunction = (t: number) => number;

export const easingFunctions: Record<string, EasingFunction> = {
  // Basic easing functions
  linear: (t: number) => t,
  
  // Quadratic
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => 1 - (1 - t) * (1 - t),
  easeInOutQuad: (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  
  // Cubic
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  
  // Quartic
  easeInQuart: (t: number) => t * t * t * t,
  easeOutQuart: (t: number) => 1 - Math.pow(1 - t, 4),
  easeInOutQuart: (t: number) => t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2,
  
  // Quintic
  easeInQuint: (t: number) => t * t * t * t * t,
  easeOutQuint: (t: number) => 1 - Math.pow(1 - t, 5),
  easeInOutQuint: (t: number) => t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2,
  
  // Sine
  easeInSine: (t: number) => 1 - Math.cos((t * Math.PI) / 2),
  easeOutSine: (t: number) => Math.sin((t * Math.PI) / 2),
  easeInOutSine: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
  
  // Exponential
  easeInExpo: (t: number) => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
  easeOutExpo: (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  easeInOutExpo: (t: number) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    return t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
  },
  
  // Circular
  easeInCirc: (t: number) => 1 - Math.sqrt(1 - Math.pow(t, 2)),
  easeOutCirc: (t: number) => Math.sqrt(1 - Math.pow(t - 1, 2)),
  easeInOutCirc: (t: number) => t < 0.5 
    ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2
    : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2,
  
  // Back
  easeInBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  easeOutBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeInOutBack: (t: number) => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },
  
  // Elastic
  easeInElastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  },
  easeOutElastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  easeInOutElastic: (t: number) => {
    const c5 = (2 * Math.PI) / 4.5;
    return t === 0 ? 0 : t === 1 ? 1 : t < 0.5
      ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
      : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
  },
  
  // Bounce
  easeInBounce: (t: number) => 1 - easingFunctions.easeOutBounce(1 - t),
  easeOutBounce: (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },
  easeInOutBounce: (t: number) => t < 0.5
    ? (1 - easingFunctions.easeOutBounce(1 - 2 * t)) / 2
    : (1 + easingFunctions.easeOutBounce(2 * t - 1)) / 2
};

export class AnimationTiming {
  public static createCustomEasing(
    x1: number, y1: number, x2: number, y2: number
  ): EasingFunction {
    // Simple cubic-bezier approximation
    return (t: number) => {
      // This is a simplified version - a full implementation would use
      // numerical methods to solve the cubic bezier equation
      return t * t * (3 - 2 * t); // Fallback to smoothstep
    };
  }

  public static chain(...easings: { easing: EasingFunction; duration: number }[]): EasingFunction {
    const totalDuration = easings.reduce((sum, e) => sum + e.duration, 0);
    
    return (t: number) => {
      let elapsed = t * totalDuration;
      
      for (const { easing, duration } of easings) {
        if (elapsed <= duration) {
          return easing(elapsed / duration);
        }
        elapsed -= duration;
      }
      
      return 1;
    };
  }

  public static repeat(easing: EasingFunction, count: number): EasingFunction {
    return (t: number) => {
      const segment = 1 / count;
      const currentSegment = Math.floor(t / segment);
      const segmentProgress = (t % segment) / segment;
      
      return easing(segmentProgress);
    };
  }

  public static reverse(easing: EasingFunction): EasingFunction {
    return (t: number) => 1 - easing(1 - t);
  }

  public static yoyo(easing: EasingFunction): EasingFunction {
    return (t: number) => {
      if (t < 0.5) {
        return easing(t * 2);
      } else {
        return easing((1 - t) * 2);
      }
    };
  }
}

// Utility function to get easing by name
export const getEasingFunction = (name: string): EasingFunction => {
  return easingFunctions[name] || easingFunctions.linear;
};

// Animation duration constants
export const ANIMATION_DURATIONS = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 1000
} as const;

// Common animation configurations
export const ANIMATION_PRESETS = {
  slideIn: { duration: ANIMATION_DURATIONS.normal, easing: 'easeOutCubic' },
  slideOut: { duration: ANIMATION_DURATIONS.fast, easing: 'easeInCubic' },
  fadeIn: { duration: ANIMATION_DURATIONS.normal, easing: 'easeOutQuad' },
  fadeOut: { duration: ANIMATION_DURATIONS.fast, easing: 'easeInQuad' },
  scaleIn: { duration: ANIMATION_DURATIONS.fast, easing: 'easeOutBack' },
  scaleOut: { duration: ANIMATION_DURATIONS.fast, easing: 'easeInBack' },
  bounce: { duration: ANIMATION_DURATIONS.slow, easing: 'easeOutBounce' },
  elastic: { duration: ANIMATION_DURATIONS.slow, easing: 'easeOutElastic' }
} as const;
