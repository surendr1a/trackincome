import React, {useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import {useAppStore} from '../store/useAppStore';
import {colors, radius, shadows, spacing} from '../theme';

export function Toast(): React.JSX.Element | null {
  const toast = useAppStore(s => s.toast);
  const clearToast = useAppStore(s => s.clearToast);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(24);

  useEffect(() => {
    if (toast) {
      opacity.value = withTiming(1, {duration: 200});
      translateY.value = withTiming(0, {duration: 220});

      opacity.value = withDelay(
        2200,
        withTiming(0, {duration: 300}, finished => {
          if (finished) {
            runOnJS(clearToast)();
          }
        }),
      );
    } else {
      opacity.value = 0;
      translateY.value = 24;
    }
  }, [toast, opacity, translateY, clearToast]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{translateY: translateY.value}],
  }));

  if (!toast) return null;

  const kindColor =
    toast.kind === 'success'
      ? colors.successSoft
      : toast.kind === 'error'
        ? colors.dangerSoft
        : colors.mint;

  return (
    <View pointerEvents="none" style={styles.wrap}>
      <Animated.View
        testID="app-toast"
        style={[styles.toast, animStyle, {backgroundColor: kindColor}]}>
        <Text style={styles.text} numberOfLines={2}>
          {toast.message}
        </Text>
      </Animated.View>
    </View>
  );
}

export default Toast;

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 100,
    alignItems: 'center',
    zIndex: 1000,
  },
  toast: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    maxWidth: '86%',
    ...shadows.soft,
  },
  text: {
    color: colors.charcoal,
    fontSize: 14,
    textAlign: 'center',
  },
});