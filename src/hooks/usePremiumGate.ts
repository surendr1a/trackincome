import {useCallback} from 'react';

import {useAppStore} from '../store/useAppStore';
import {PaywallTrigger} from '../types';
import {hapticWarning} from '../services/haptics';

type PremiumGateResult = {
  isPremium: boolean;
  ensurePremium: (trigger: PaywallTrigger) => boolean;
  openPaywall: (trigger: PaywallTrigger) => void;
};

export function usePremiumGate(): PremiumGateResult {
  const isPremium = useAppStore(s => s.premium.isPremium);
  const openStorePaywall = useAppStore(s => s.openPaywall);

  const openPaywall = useCallback(
    (trigger: PaywallTrigger) => {
      hapticWarning();
      openStorePaywall(trigger);
    },
    [openStorePaywall],
  );

  const ensurePremium = useCallback(
    (trigger: PaywallTrigger) => {
      if (isPremium) return true;
      openPaywall(trigger);
      return false;
    },
    [isPremium, openPaywall],
  );

  return {isPremium, ensurePremium, openPaywall};
}
