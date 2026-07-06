import React from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useTranslation} from 'react-i18next';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {useAppStore} from '../store/useAppStore';
import {colors, radius, shadows, spacing} from '../theme';
import {hapticSelection, hapticSuccess} from '../services/haptics';
import {PRODUCTS} from '../services/iap';

export function PaywallModal(): React.JSX.Element | null {
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();

  const visible = useAppStore(s => s.isPaywallVisible);
  const trigger = useAppStore(s => s.paywallTrigger);
  const close = useAppStore(s => s.closePaywall);
  const purchase = useAppStore(s => s.purchasePlan);
  const restore = useAppStore(s => s.restorePurchases);
  const showToast = useAppStore(s => s.showToast);

  if (!visible) return null;

  const triggerMap: Record<string, string> = {
    MONTHLY_SHIFT_LIMIT: t('paywall.trigger_shift_limit'),
    MULTI_JOB_LIMIT: t('paywall.trigger_multi_job'),
    NIGHT_SHIFT_ANALYTICS: t('paywall.trigger_analytics'),
    TAX_ESTIMATOR: t('paywall.trigger_tax'),
    CSV_EXPORT: t('paywall.trigger_csv'),
    BACKUP: t('paywall.trigger_analytics'),
  };

  const features = t('paywall.features', {returnObjects: true}) as string[];

  const handlePurchase = async (productId: string) => {
    hapticSelection();
    await purchase(productId);
    showToast(t('paywall.purchased_toast'), 'success');
    hapticSuccess();
  };

  const handleRestore = async () => {
    hapticSelection();
    await restore();
    showToast(t('paywall.restored_toast'), 'info');
  };

  return (
    <View style={styles.overlay} testID="paywall-modal">
      <View style={styles.backdrop} />

      <View style={[styles.sheet, {paddingBottom: insets.bottom + spacing.xl}]}>
        <ScrollView
          contentContainerStyle={{paddingBottom: spacing.xl}}
          showsVerticalScrollIndicator={false}>
          <Pressable
            testID="paywall-close-button"
            onPress={close}
            style={[styles.closeBtn, {top: insets.top + spacing.sm}]}>
            <Feather name="x" size={22} color={colors.charcoal} />
          </Pressable>

          <View style={[styles.header, {marginTop: insets.top + spacing.xxl}]}>
            <View style={styles.crown}>
              <Feather name="award" size={40} color={colors.gold} />
            </View>

            <Text style={styles.title}>{t('paywall.title')}</Text>
            <Text style={styles.subtitle}>{t('paywall.subtitle')}</Text>
          </View>

          {trigger && triggerMap[trigger] ? (
            <View style={styles.triggerCard}>
              <Feather name="info" size={16} color={colors.gold} />
              <Text style={styles.triggerText}>{triggerMap[trigger]}</Text>
            </View>
          ) : null}

          <View style={styles.features}>
            {features.map((feature, index) => (
              <View key={`${feature}-${index}`} style={styles.featureRow}>
                <Feather name="check" size={18} color={colors.mintStrong} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          <Pressable
            testID="paywall-buy-lifetime"
            onPress={() => handlePurchase(PRODUCTS.lifetime)}
            style={({pressed}) => [
              styles.ctaPrimary,
              pressed && {opacity: 0.85},
            ]}>
            <View>
              <Text style={styles.ctaLabel}>{t('paywall.lifetime')}</Text>
              <Text style={styles.ctaPrice}>{t('paywall.lifetime_price')}</Text>
            </View>
            <Text style={styles.ctaCTA}>{t('paywall.cta_lifetime')}</Text>
          </Pressable>

          <Pressable
            testID="paywall-buy-monthly"
            onPress={() => handlePurchase(PRODUCTS.monthly)}
            style={({pressed}) => [
              styles.ctaSecondary,
              pressed && {opacity: 0.85},
            ]}>
            <View>
              <Text style={styles.ctaLabelDark}>{t('paywall.monthly')}</Text>
              <Text style={styles.ctaPriceDark}>
                {t('paywall.monthly_price')}
              </Text>
            </View>
            <Text style={styles.ctaCTADark}>{t('paywall.cta_monthly')}</Text>
          </Pressable>

          <Pressable
            testID="paywall-restore-button"
            onPress={handleRestore}
            style={styles.restore}>
            <Text style={styles.restoreText}>{t('paywall.restore')}</Text>
          </Pressable>

          <View style={styles.legalRow}>
            <Text style={styles.legalLink}>{t('paywall.privacy')}</Text>
            <Text style={styles.legalDot}>•</Text>
            <Text style={styles.legalLink}>{t('paywall.terms')}</Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

export default PaywallModal;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2000,
    elevation: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  sheet: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
  },
  closeBtn: {
    position: 'absolute',
    right: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    zIndex: 10,
    ...shadows.subtle,
  },
  header: {alignItems: 'center', marginBottom: spacing.xl},
  crown: {
    width: 72,
    height: 72,
    borderRadius: 999,
    backgroundColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    color: colors.charcoal,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: colors.mutedText,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
  },
  triggerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.goldSoft,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  triggerText: {color: colors.charcoal, flex: 1, fontSize: 13},
  features: {gap: spacing.md, marginBottom: spacing.xl},
  featureRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.md},
  featureText: {color: colors.charcoal, fontSize: 15, flex: 1},
  ctaPrimary: {
    backgroundColor: colors.charcoal,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    ...shadows.soft,
  },
  ctaLabel: {color: '#FFFFFF', fontSize: 14, opacity: 0.75},
  ctaPrice: {color: '#FFFFFF', fontSize: 22, fontWeight: '500', marginTop: 2},
  ctaCTA: {color: colors.gold, fontSize: 15, fontWeight: '500'},
  ctaSecondary: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  ctaLabelDark: {color: colors.charcoal, fontSize: 14, opacity: 0.75},
  ctaPriceDark: {
    color: colors.charcoal,
    fontSize: 22,
    fontWeight: '500',
    marginTop: 2,
  },
  ctaCTADark: {color: colors.mintStrong, fontSize: 15, fontWeight: '500'},
  restore: {alignSelf: 'center', padding: spacing.md, marginBottom: spacing.sm},
  restoreText: {
    color: colors.mutedText,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legalLink: {color: colors.mutedText, fontSize: 12},
  legalDot: {color: colors.mutedText, fontSize: 12},
});