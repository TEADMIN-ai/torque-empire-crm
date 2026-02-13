import { serverTimestamp } from 'firebase/firestore';
import { computeTenderReadiness } from '../tender/computeTenderReadiness';
import type { Deal, DealActor, ReadinessResult } from '../../types/deal';
import { updateDealStage } from './updateDealStage';

export type SubmitTenderResult =
  | { ok: true; deal: Deal }
  | { ok: false; message: string; readiness: ReadinessResult };

export const submitTender = async ({
  deal,
  actor,
}: {
  deal: Deal;
  actor?: DealActor | null;
}): Promise<SubmitTenderResult> => {
  const readiness = computeTenderReadiness(deal);

  if (!readiness.isReady) {
    return {
      ok: false,
      message: `Tender is not ready. Missing fields: ${readiness.missingFields.join(', ') || 'none'}. Missing documents: ${readiness.missingDocuments.join(', ') || 'none'}.`,
      readiness,
    };
  }

  const updated = await updateDealStage({
    dealId: deal.id,
    fromStage: deal.stage,
    toStage: 'submitted',
    actor,
    meta: {
      isTenderLocked: true,
      tenderSubmittedAt: serverTimestamp(),
      tenderSubmittedBy: actor?.uid || null,
    },
  });

  return { ok: true, deal: updated };
};
