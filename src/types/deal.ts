export type DealStage =
  | 'new'
  | 'discovery'
  | 'manager_review'
  | 'submitted'
  | 'closed';

export type PricingStatus =
  | 'pending'
  | 'in_review'
  | 'manager_approved'
  | 'rejected'
  | string;

export type DealActor = {
  uid: string;
  displayName?: string | null;
  email?: string | null;
};

export type Deal = {
  id: string;
  stage: DealStage;
  pricingStatus?: PricingStatus;
  assignedTo?: string | null;
  isTenderLocked?: boolean;
  firstResponseAt?: unknown;
  managerApprovedAt?: unknown;
  submittedAt?: unknown;
  closedAt?: unknown;
  updatedAt?: unknown;
  pricingApprovedAt?: unknown;
  pricingApprovedBy?: string | null;
  tenderSubmittedAt?: unknown;
  tenderSubmittedBy?: string | null;
  stageUpdatedBy?: string | null;
  stageUpdatedByName?: string | null;
  [key: string]: unknown;
};

export const allowedTransitions: Record<DealStage, DealStage[]> = {
  new: ['discovery', 'manager_review'],
  discovery: ['manager_review', 'closed'],
  manager_review: ['submitted', 'closed'],
  submitted: ['closed'],
  closed: [],
};

export type ReadinessResult = {
  isReady: boolean;
  missingFields: string[];
  missingDocuments: string[];
  reason?: string;
};
