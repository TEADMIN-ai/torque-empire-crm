import React from 'react';
import type { Deal } from '../../types/deal';
import { computeTenderReadiness } from '../../lib/tender/computeTenderReadiness';

type Props = {
  deal: Deal;
  onSubmitTender: (deal: Deal) => void | Promise<void>;
  isSubmitting?: boolean;
};

const DealCard = ({ deal, onSubmitTender, isSubmitting = false }: Props) => {
  const readiness = computeTenderReadiness(deal);
  const canShowSubmit = deal.pricingStatus === 'manager_approved';
  const alreadyLocked = Boolean(deal.isTenderLocked || deal.stage === 'submitted' || deal.stage === 'closed');
  const disabled = isSubmitting || alreadyLocked || !readiness.isReady;

  return (
    <div>
      <div>Deal #{deal.id}</div>
      {canShowSubmit ? (
        <div>
          <button type="button" disabled={disabled} onClick={() => onSubmitTender(deal)}>
            Submit Tender
          </button>
          {disabled && (
            <ul>
              {alreadyLocked ? <li>This deal is already submitted/locked.</li> : null}
              {readiness.missingFields.map((field) => (
                <li key={`field-${field}`}>Missing field: {field}</li>
              ))}
              {readiness.missingDocuments.map((doc) => (
                <li key={`doc-${doc}`}>Missing document: {doc}</li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default DealCard;
