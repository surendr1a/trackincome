import { premiumRepo } from "../db/storage";
import { PremiumStatus } from "../types";

export const PRODUCTS = {
  entitlement: "premium",
  monthly: "zenshift_monthly_400",
  lifetime: "zenshift_lifetime_2500",
};

export async function initIAP(): Promise<PremiumStatus> {
  return premiumRepo.get();
}

export async function purchase(
  productId: string
): Promise<PremiumStatus> {
  await new Promise((resolve) => setTimeout(resolve, 700));

  const status: PremiumStatus = {
    isPremium: true,
    entitlementId: PRODUCTS.entitlement,
    activeProductId: productId,
  };

  await premiumRepo.save(status);
  return status;
}

export async function restore(): Promise<PremiumStatus> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return premiumRepo.get();
}

export async function devTogglePremium(): Promise<PremiumStatus> {
  const current = await premiumRepo.get();

  const next: PremiumStatus = current.isPremium
    ? {
        isPremium: false,
      }
    : {
        isPremium: true,
        entitlementId: PRODUCTS.entitlement,
        activeProductId: "dev_toggle",
      };

  await premiumRepo.save(next);
  return next;
}