import React, {useEffect, useState} from 'react';
import 'react-native-gesture-handler';
import {
  ActivityIndicator,
  LogBox,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {I18nextProvider} from 'react-i18next';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import i18n, {initI18n} from '../i18n';
import {useAppStore} from '../store/useAppStore';
import {PaywallModal} from '../components/PaywallModal';
import {Toast} from '../components/Toast';
import {colors} from '../theme';

import MainTabs from './MainTabs';
import OnboardingScreen from '../screens/OnboardingScreen';
import ShiftEditorModal from '../modals/ShiftEditorModal';
import JobEditorModal from '../modals/JobEditorModal';
import PremiumPaywallModal from '../modals/PremiumPaywallModal';

LogBox.ignoreAllLogs(true);

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const [ready, setReady] = useState(false);
  const loadInitialData = useAppStore(s => s.loadInitialData);

  useEffect(() => {
    async function bootstrap() {
      await initI18n();
      await loadInitialData();
      setReady(true);
    }

    bootstrap();
  }, [loadInitialData]);

  if (!ready) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.mintStrong} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <I18nextProvider i18n={i18n}>
          <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
                contentStyle: {backgroundColor: colors.background},
              }}>
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen name="MainTabs" component={MainTabs} />
              <Stack.Screen
                name="ShiftEditor"
                component={ShiftEditorModal}
                options={{presentation: 'modal'}}
              />
              <Stack.Screen
                name="JobEditor"
                component={JobEditorModal}
                options={{presentation: 'modal'}}
              />
              <Stack.Screen
                name="PremiumPaywall"
                component={PremiumPaywallModal}
                options={{presentation: 'fullScreenModal'}}
              />
            </Stack.Navigator>
          </NavigationContainer>
          <PaywallModal />
          <Toast />
        </I18nextProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  loader: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});