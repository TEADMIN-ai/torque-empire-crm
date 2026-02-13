import React, { useCallback, useMemo, useState } from 'react';
import DealCard from '../../../components/deals/DealCard';
import { submitTender } from '../../../lib/deals/submitTender';
import { updateDealStage } from '../../../lib/deals/updateDealStage';
import type { Deal, DealActor, DealStage } from '../../../types/deal';

type Props = {
  initialDeals?: Deal[];
  actor?: DealActor | null;
};

const DealsClient = ({ initialDeals = [], actor = null }: Props) => {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [busyId, setBusyId] = useState<string | null>(null);

  const byId = useMemo(() => new Map(deals.map((deal) => [deal.id, deal])), [deals]);

  const replaceDeal = useCallback((next: Deal) => {
    setDeals((prev) => prev.map((item) => (item.id === next.id ? { ...item, ...next } : item)));
  }, []);

  const onStageChange = useCallback(
    async (dealId: string, toStage: DealStage) => {
      const current = byId.get(dealId);
      if (!current) {
        return;
      }

      setBusyId(dealId);
      try {
        const updated = await updateDealStage({
          dealId,
          fromStage: current.stage,
          toStage,
          actor,
        });
        replaceDeal(updated);
      } finally {
        setBusyId(null);
      }
    },
    [actor, byId, replaceDeal]
  );

  const onSubmitTender = useCallback(
    async (deal: Deal) => {
      setBusyId(deal.id);
      try {
        const result = await submitTender({ deal, actor });
        if (result.ok) {
          replaceDeal(result.deal);
          return;
        }

        // eslint-disable-next-line no-alert
        alert(result.message);
      } finally {
        setBusyId(null);
      }
    },
    [actor, replaceDeal]
  );

  return (
    <div>
      {deals.map((deal) => (
        <div key={deal.id}>
          <DealCard deal={deal} onSubmitTender={onSubmitTender} isSubmitting={busyId === deal.id} />
          <button type="button" onClick={() => onStageChange(deal.id, 'closed')} disabled={busyId === deal.id}>
            Close
          </button>
        </div>
      ))}
    </div>
  );
};

export default DealsClient;
