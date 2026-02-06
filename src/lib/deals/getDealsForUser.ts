import admin from '../firebase/admin';

type FirestoreDeal = Record<string, unknown>;

export type Deal = FirestoreDeal & {
  id?: string;
};

export const getDealsForUser = async (userId?: string | null): Promise<Deal[]> => {
  if (!userId) {
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

    const snapshot = await firestore.collection('deals').where('ownerId', '==', userId).get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as FirestoreDeal),
    }));
  } catch {
    return [];
  }
};
