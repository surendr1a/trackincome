import React from 'react';
import {StyleSheet, View, ViewStyle} from 'react-native';

import {colors, radius, shadows, spacing} from '../theme';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  padded?: boolean;
  testID?: string;
};

export function ZenCard({
  children,
  style,
  padded = true,
  testID,
}: Props): React.JSX.Element {
  return (
    <View
      testID={testID}
      style={[styles.card, padded && styles.padded, style]}>
      {children}
    </View>
  );
}

export default ZenCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    ...shadows.soft,
  },
  padded: {
    padding: spacing.lg,
  },
});