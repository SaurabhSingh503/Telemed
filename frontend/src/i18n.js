/* eslint-disable */
// i18next configuration for multilingual support
// Supports English, Hindi, and Punjabi languages
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files from src directory
import enTranslation from './locales/en/translation.json';
import hiTranslation from './locales/hi/translation.json';
import paTranslation from './locales/pa/translation.json';

i18n
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    lng: 'en', // Default language
    debug: false,
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    // Load translations directly
    resources: {
      en: {
        translation: enTranslation
      },
      hi: {
        translation: hiTranslation
      },
      pa: {
        translation: paTranslation
      }
    }
  });

export default i18n;
