import admin from '../firebase/admin';
import { firebaseAuth } from '../../firebase';

type FirestoreDeal = Record<string, unknown>;

export type Deal = FirestoreDeal & {
  id?: string;
};

export const getDealsForUser = async (userId?: string | null): Promise<Deal[]> => {
  const resolvedUserId = userId ?? firebaseAuth?.currentUser?.uid ?? null;

  if (!resolvedUserId) {
    return [];
  }

  try {
    if (!admin.apps.length) {
      return [];
    }

    const firestore = admin.firestore?.();
    if (!firestore) {
      return [];
    }

    const snapshot = await firestore.collection('deals').where('ownerId', '==', resolvedUserId).get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as FirestoreDeal),
    }));
  } catch {
    return [];
  }
};
