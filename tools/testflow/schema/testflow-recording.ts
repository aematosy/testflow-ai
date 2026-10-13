export interface TestFlowSession {
  id: string;
  name: string;
  sourceOrigin: string;
}

export interface TestFlowStep {
  id: string;
  name: string;
  page: string;
  actions: number[];
}

export interface AutomationProfile {
  profileVersion: string;
  targetFrameworks: string[];
  principles?: Record<string, unknown>;
  actions?: unknown[];
}

export interface RecordedAction {
  sequence: number;
  action: string;
  stepId?: string;
  stepName?: string;
  skip?: boolean;
  sensitive?: boolean;
  [key: string]: unknown;
}

export interface TestFlowRecording {
  schemaVersion: string;
  generatedAt: string;
  session: TestFlowSession;
  language?: string;
  executionPlan?: {
    skipSequences?: number[];
  };
  steps: TestFlowStep[];
  automationProfile?: AutomationProfile;
  actions: RecordedAction[];
}
