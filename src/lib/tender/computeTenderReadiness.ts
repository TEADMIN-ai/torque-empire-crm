import type { Deal, ReadinessResult } from '../../types/deal';

export const computeTenderReadiness = (deal: Partial<Deal> | null | undefined): ReadinessResult => {
  const missingFields: string[] = [];
  const missingDocuments: string[] = [];

  if (!deal) {
    return {
      isReady: false,
      missingFields: ['deal'],
      missingDocuments,
      reason: 'Deal record is unavailable.',
    };
  }

  if (deal.pricingStatus !== 'manager_approved') {
    missingFields.push('pricingStatus: manager_approved');
  }

  if (deal.stage !== 'manager_review') {
    missingFields.push('stage: manager_review');
  }

  if (!deal.assignedTo) {
    missingFields.push('assignedTo');
  }

  if (deal.isTenderLocked || deal.stage === 'submitted' || deal.stage === 'closed') {
    missingFields.push('deal must be open for submission');
  }

  return {
    isReady: missingFields.length === 0 && missingDocuments.length === 0,
    missingFields,
    missingDocuments,
    reason:
      missingFields.length || missingDocuments.length
        ? 'Tender cannot be submitted until required data is complete.'
        : undefined,
  };
};
