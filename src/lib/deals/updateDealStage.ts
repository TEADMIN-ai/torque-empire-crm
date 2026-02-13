import { doc, getDoc, getFirestore, serverTimestamp, updateDoc } from 'firebase/firestore';
import { firebaseApp } from '../../firebase';
import type { Deal, DealActor, DealStage } from '../../types/deal';
import { allowedTransitions } from '../../types/deal';

export type UpdateDealStageParams = {
  dealId: string;
  fromStage: DealStage;
  toStage: DealStage;
  actor?: DealActor | null;
  assignedTo?: string | null;
  meta?: Record<string, unknown>;
};

const hasValue = (value: unknown): boolean => value !== undefined && value !== null;

const ensureValidTransition = (fromStage: DealStage, toStage: DealStage) => {
  if (fromStage === toStage) {
    return;
  }

  const possible = allowedTransitions[fromStage] || [];
  if (!possible.includes(toStage)) {
    throw new Error(`Illegal stage transition: ${fromStage} -> ${toStage}`);
  }
};

export const updateDealStage = async ({
  dealId,
  fromStage,
  toStage,
  actor,
  assignedTo,
  meta,
}: UpdateDealStageParams): Promise<Deal> => {
  if (!firebaseApp) {
    throw new Error('Firebase app is not configured.');
  }

  ensureValidTransition(fromStage, toStage);

  const firestore = getFirestore(firebaseApp);
  const dealRef = doc(firestore, 'deals', dealId);
  const currentSnap = await getDoc(dealRef);

  if (!currentSnap.exists()) {
    throw new Error('Deal not found.');
  }

  const current = currentSnap.data() as Deal;
  if (current.stage !== fromStage) {
    throw new Error(`Stage mismatch. Expected ${fromStage}, found ${current.stage}.`);
  }

  const patch: Record<string, unknown> = {
    stage: toStage,
    updatedAt: serverTimestamp(),
  };

  if (assignedTo !== undefined) {
    patch.assignedTo = assignedTo;
  }

  if (actor?.uid) {
    patch.stageUpdatedBy = actor.uid;
    patch.stageUpdatedByName = actor.displayName || actor.email || actor.uid;
  }

  if (meta) {
    Object.assign(patch, meta);
  }

  if (toStage === 'manager_review' && !hasValue(current.firstResponseAt)) {
    patch.firstResponseAt = serverTimestamp();
  }

  const pricingStatusAfter = (meta?.pricingStatus as string | undefined) ?? (current.pricingStatus as string | undefined);
  if (pricingStatusAfter === 'manager_approved' && !hasValue(current.managerApprovedAt)) {
    patch.managerApprovedAt = serverTimestamp();
  }

  if (toStage === 'submitted' && !hasValue(current.submittedAt)) {
    patch.submittedAt = serverTimestamp();
    patch.isTenderLocked = true;
  }

  if (toStage === 'closed' && !hasValue(current.closedAt)) {
    patch.closedAt = serverTimestamp();
  }

  await updateDoc(dealRef, patch);

  return {
    ...current,
    ...patch,
    id: dealId,
    stage: toStage,
  } as Deal;
};
