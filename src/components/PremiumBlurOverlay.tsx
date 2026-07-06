import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useTranslation} from 'react-i18next';

import {colors, radius, spacing} from '../theme';

type Props = {
  onUnlock: () => void;
  height?: number;
  testID?: string;
};

export function PremiumBlurOverlay({
  onUnlock,
  height = 220,
  testID,
}: Props): React.JSX.Element {
  const {t} = useTranslation();

  return (
    <View style={[styles.wrap, {height}]} testID={testID}>
      {/* BlurView replaced with semi-transparent overlay for React Native CLI */}

      <View style={styles.blurOverlay} />
      <View style={styles.dim} />

      <View style={styles.center}>
        <View style={styles.lockCircle}>
          <Feather name="lock" size={22} color={colors.gold} />
        </View>

        <Text style={styles.title}>
          {t('dashboard.premium_locked_title')}
        </Text>

        <Text style={styles.body}>
          {t('dashboard.premium_locked_body')}
        </Text>

        <Pressable
          testID={`${testID ?? 'premium-overlay'}-unlock`}
          onPress={onUnlock}
          style={({pressed}) => [
            styles.cta,
            pressed && {opacity: 0.85},
          ]}>
          <Feather name="unlock" size={16} color="#FFFFFF" />

          <Text style={styles.ctaText}>{t('dashboard.unlock')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default PremiumBlurOverlay;

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.lg,
    overflow: 'hidden',
    zIndex: 5,
  },

  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.72)',
  },

  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },

  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },

  lockCircle: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },

  title: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.charcoal,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },

  body: {
    fontSize: 13,
    color: colors.mutedText,
    textAlign: 'center',
    marginBottom: spacing.md,
  },

  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.charcoal,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 999,
  },

  ctaText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});