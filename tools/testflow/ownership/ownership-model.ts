export type OwnershipType =
  | 'page'
  | 'component';

export interface OwnershipDecision {
  stepId: string;
  stepName: string;

  ownership: OwnershipType;

  domainName: string;

  confidence: number;

  reason: string;
}
