export type CanonicalActionType =
  | 'click'
  | 'type'
  | 'select'
  | 'assert'
  | 'doubleClick'
  | 'rightClick'
  | string;

export interface CanonicalLocator {
  kind: string;
  value: string;
  strategy?: string;
  robustness?: string;
}

export interface CanonicalTarget {
  key: string;
  semanticName: string;
  role?: string;
  label?: string;

  attributes: {
    id?: string;
    name?: string;
    placeholder?: string;
    testId?: string;
    ariaLabel?: string;
  };

  preferredLocator?: CanonicalLocator;

  playwright?: {
    preferredStrategy?: string;
    preferred?: string;
    locatorFallback?: string;
    interactionTemplate?: string;
  };
}

export interface CanonicalAction {
  sequence: number;
  type: CanonicalActionType;
  name: string;
  targetKey?: string;
  sensitive: boolean;
  skipped: boolean;
  value?: string;
  assertion?: {
    type?: string;
    expected?: unknown;
  };
}

export interface CanonicalStep {
  id: string;
  name: string;
  page: string;
  actions: CanonicalAction[];
}

export interface CanonicalTestFlow {
  modelVersion: '1.0';

  recording: {
    schemaVersion: string;
    sessionId: string;
    sessionName: string;
    generatedAt: string;
  };

  application: {
    origin: string;
    language?: string;
  };

  steps: CanonicalStep[];

  targets: CanonicalTarget[];

  statistics: {
    steps: number;
    actions: number;
    assertions: number;
    sensitiveActions: number;
    skippedActions: number;
    uniqueTargets: number;
  };
}
