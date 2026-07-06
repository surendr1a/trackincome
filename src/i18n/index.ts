import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './en.json';
import ja from './ja.json';

const LANGUAGE_KEY = '@zenshift/language';

export async function initI18n() {
  let stored: string |null = null;

  try {
    stored = await AsyncStorage.getItem(LANGUAGE_KEY);
  } catch (e) {
    // ignore
  }

  const locales = RNLocalize.getLocales();

  const deviceLanguage =
    locales.length > 0 ? locales[0].languageCode : 'en';

  const initialLanguage =
    stored ?? (deviceLanguage === 'ja' ? 'ja' : 'en');

  if (!i18n.isInitialized) {
    await i18n
      .use(initReactI18next)
      .init({
        resources: {
          en: {
            translation: en,
          },
          ja: {
            translation: ja,
          },
        },
        lng: initialLanguage,
        fallbackLng: 'en',
        compatibilityJSON: 'v4',
        interpolation: {
          escapeValue: false,
        },
      });
  }

  return i18n;
}

export async function setLanguage(
  language: 'en' | 'ja',
) {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
  } catch (e) {
    // ignore
  }

  await i18n.changeLanguage(language);
}

export default i18n;