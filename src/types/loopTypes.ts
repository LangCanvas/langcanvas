
export type LoopType = 
  | 'self-loop'
  | 'forward-loop'
  | 'conditional-loop'
  | 'retry-loop'
  | 'validation-loop'
  | 'multi-tool-loop'
  | 'agent-tool-loop'
  | 'agent-reasoning-loop'
  | 'human-in-loop'
  | 'multi-agent-loop';

export interface LoopTerminationCondition {
  type: 'expression' | 'max-iterations' | 'timeout' | 'error-threshold';
  value: string | number;
  description?: string;
}

export interface LoopBehaviorSettings {
  statePreservation: boolean;
  inputTransformation: string;
  outputTransformation: string;
  errorHandling: 'stop' | 'continue' | 'retry';
  memoryManagement: 'preserve' | 'reset' | 'selective';
}

export interface ToolLoopSettings {
  retryStrategy: 'exponential-backoff' | 'fixed-delay' | 'immediate';
  toolTimeout: number;
  resultValidation: string;
  failureHandling: 'abort' | 'fallback' | 'continue';
  preprocessing: string;
  postprocessing: string;
}

export interface AgentLoopSettings {
  contextWindowManagement: 'sliding' | 'summarization' | 'truncation';
  memoryRetention: 'full' | 'selective' | 'summary';
  decisionConfidenceThreshold: number;
  humanInterventionTriggers: string[];
  temperatureAdjustment: boolean;
  tokenLimitManagement: boolean;
  qualityChecking: boolean;
  hallucinationDetection: boolean;
}

export interface LoopSafetySettings {
  emergencyStopConditions: string[];
  performanceMonitoring: boolean;
  resourceUsageLimits: {
    memory: number;
    cpu: number;
    time: number;
  };
  executionLogging: boolean;
}

export interface HumanInterventionSettings {
  manualApprovalPoints: string[];
  breakpointInsertion: boolean;
  realTimeMonitoring: boolean;
  emergencyStopButton: boolean;
}

export interface NodeLoopConfig {
  enabled: boolean;
  loopType: LoopType;
  terminationConditions: LoopTerminationCondition[];
  behaviorSettings?: LoopBehaviorSettings;
  toolSettings?: ToolLoopSettings;
  agentSettings?: AgentLoopSettings;
  safetySettings: LoopSafetySettings;
  humanIntervention: HumanInterventionSettings;
  warnings: string[];
}
