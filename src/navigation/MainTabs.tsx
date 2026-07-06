import React from 'react';
import {View, Pressable, StyleSheet, Text} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';

import CalendarScreen from '../screens/tabs/CalendarScreen';
import JobsScreen from '../screens/tabs/JobsScreen';
import DashboardScreen from '../screens/tabs/DashboardScreen';
import SettingsScreen from '../screens/tabs/SettingsScreen';
import {colors, radius, shadows, spacing} from '../theme';
import {hapticLight} from '../services/haptics';

const Tab = createBottomTabNavigator();

type TabConfig = {
  name: string;
  labelKey: string;
  icon: string;
  testID: string;
};

const TABS: TabConfig[] = [
  {name: 'Calendar', labelKey: 'tabs.calendar', icon: '📅', testID: 'tab-calendar'},
  {name: 'Jobs', labelKey: 'tabs.jobs', icon: '💼', testID: 'tab-jobs'},
  {name: 'Dashboard', labelKey: 'tabs.dashboard', icon: '📊', testID: 'tab-dashboard'},
  {name: 'Settings', labelKey: 'tabs.settings', icon: '⚙️', testID: 'tab-settings'},
];

function TabIcon({
  focused,
  icon,
  label,
  onPress,
  testID,
}: {
  focused: boolean;
  icon: string;
  label: string;
  onPress: () => void;
  testID: string;
}) {
  const scale = useSharedValue(focused ? 1.15 : 1);

  React.useEffect(() => {
    scale.value = withSpring(focused ? 1.15 : 1, {
      damping: 12,
      stiffness: 160,
    });
  }, [focused, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  return (
    <Pressable
      testID={testID}
      onPress={() => {
        hapticLight();
        onPress();
      }}
      style={styles.tabItem}>
      <Animated.View
        style={[styles.iconWrap, focused && styles.iconWrapActive, animStyle]}>
        <Text style={styles.iconText}>{icon}</Text>
      </Animated.View>

      <Text
        style={[styles.tabLabel, focused && styles.tabLabelActive]}
        numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function CustomTabBar({state, navigation}: any) {
  const insets = useSafeAreaInsets();
  const {t} = useTranslation();

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        {paddingBottom: Math.max(insets.bottom, spacing.md)},
      ]}>
      <View style={styles.barShadow}>
        <View style={styles.barInner}>
          {state.routes.map((route: any, i: number) => {
            const conf = TABS.find(item => item.name === route.name) ?? TABS[i];
            const focused = state.index === i;

            return (
              <TabIcon
                key={route.key}
                focused={focused}
                icon={conf.icon}
                label={t(conf.labelKey)}
                testID={conf.testID}
                onPress={() => {
                  if (!focused) {
                    navigation.navigate(route.name);
                  }
                }}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={props => <CustomTabBar {...props} />}>
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Jobs" component={JobsScreen} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  barShadow: {
    width: '100%',
    borderRadius: radius.pill,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.96)',
    ...shadows.soft,
  },
  barInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconWrapActive: {
    backgroundColor: colors.charcoal,
  },
  iconText: {
    fontSize: 19,
  },
  tabLabel: {
    fontSize: 10,
    color: colors.mutedText,
    marginTop: 2,
  },
  tabLabelActive: {
    color: colors.charcoal,
    fontWeight: '500',
  },
});