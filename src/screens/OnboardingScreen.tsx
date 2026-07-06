import React, {useRef, useState} from 'react';
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';

import {settingsRepo, jobsRepo} from '../db/storage';
import {colors, radius, spacing} from '../theme';
import {hapticSelection} from '../services/haptics';

const {width} = Dimensions.get('window');

const slides = [
  {
    key: 's1',
    image: 'https://images.pexels.com/photos/17158016/pexels-photo-17158016.jpeg',
    titleKey: 'onboarding.slide1_title',
    bodyKey: 'onboarding.slide1_body',
  },
  {
    key: 's2',
    image: 'https://images.pexels.com/photos/31192317/pexels-photo-31192317.jpeg',
    titleKey: 'onboarding.slide2_title',
    bodyKey: 'onboarding.slide2_body',
  },
  {
    key: 's3',
    image:
      'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsJTIwd29ya3NwYWNlJTIwbmF0dXJhbCUyMGxpZ2h0fGVufDB8fHx8MTc4MzA1MzUyOXww&ixlib=rb-4.1.0&q=85',
    titleKey: 'onboarding.slide3_title',
    bodyKey: 'onboarding.slide3_body',
  },
];

export default function OnboardingScreen(): React.JSX.Element {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const finish = async () => {
    hapticSelection();

    const existing = await jobsRepo.getAll();

    if (existing.length === 0) {
      const now = new Date().toISOString();

      await jobsRepo.saveAll([
        {
          id: `sample-${Date.now()}`,
          name: 'Cafe Stardust',
          emoji: '☕',
          color: '#81C784',
          hourlyRate: 1200,
          commuteAllowance: 500,
          paydayDay: 25,
          weekendMultiplier: 1.0,
          holidayMultiplier: 1.25,
          nightShiftEnabled: true,
          createdAt: now,
          updatedAt: now,
        },
      ]);
    }

    await settingsRepo.setOnboarded(true);

    navigation.reset({
      index: 0,
      routes: [{name: 'MainTabs' as never}],
    });
  };

  const next = () => {
    if (index < slides.length - 1) {
      hapticSelection();
      scrollRef.current?.scrollTo({
        x: (index + 1) * width,
        animated: true,
      });
      return;
    }

    finish();
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);

    if (nextIndex !== index) {
      setIndex(nextIndex);
    }
  };

  return (
    <View style={styles.container} testID="onboarding-screen">
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}>
        {slides.map(slide => (
          <View key={slide.key} style={[styles.slide, {width}]}>
            <Image
              source={{uri: slide.image}}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />

            <LinearGradient
              colors={[
                'rgba(44,62,80,0)',
                'rgba(44,62,80,0.7)',
                'rgba(44,62,80,0.92)',
              ]}
              style={StyleSheet.absoluteFill}
            />

            <View
              style={[
                styles.textWrap,
                {paddingBottom: insets.bottom + 180},
              ]}>
              <Text style={styles.slideTitle}>{t(slide.titleKey)}</Text>
              <Text style={styles.slideBody}>{t(slide.bodyKey)}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, {paddingBottom: insets.bottom + spacing.lg}]}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>

        <Pressable
          testID="onboarding-next-button"
          onPress={next}
          style={({pressed}) => [styles.cta, pressed && {opacity: 0.85}]}>
          <Text style={styles.ctaText}>
            {index === slides.length - 1
              ? t('onboarding.start')
              : t('onboarding.next')}
          </Text>
        </Pressable>

        {index < slides.length - 1 ? (
          <Pressable
            testID="onboarding-skip-button"
            onPress={finish}
            style={styles.skipBtn}>
            <Text style={styles.skip}>{t('onboarding.skip')}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.charcoal},
  slide: {flex: 1, justifyContent: 'flex-end'},
  textWrap: {paddingHorizontal: spacing.xl},
  slideTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '500',
    lineHeight: 36,
    marginBottom: spacing.md,
  },
  slideBody: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 16,
    lineHeight: 24,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  dots: {flexDirection: 'row', gap: 6, marginBottom: spacing.lg},
  dot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  dotActive: {width: 24, backgroundColor: '#FFFFFF'},
  cta: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: {color: colors.charcoal, fontSize: 16, fontWeight: '500'},
  skipBtn: {padding: spacing.md, marginTop: spacing.sm},
  skip: {color: 'rgba(255,255,255,0.85)', fontSize: 14},
});