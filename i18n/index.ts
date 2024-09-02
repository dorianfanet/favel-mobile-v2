import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import resources from "./locales";
import { MMKVLoader } from "react-native-mmkv-storage";
// import translationEn from "./locales/en-US/translation.json";
// import translationFr from "./locales/fr-FR/translation.json";

// const resources = {
//   "en-US": { translation: translationEn },
//   "fr-FR": { translation: translationFr },
// };

const MMKV = new MMKVLoader().initialize();

const initI18n = () => {
  // let savedLanguage = await AsyncStorage.getItem("language");

  const savedLanguage = MMKV.getString("language");

  if (!savedLanguage) {
    MMKV.setString("language", "en");
    //   savedLanguage = Localization.locale;
  }

  // const locales = Localization.getLocales();

  i18n.use(initReactI18next).init({
    compatibilityJSON: "v3",
    resources,
    // resources: {
    //   "en-US": {
    //     translation: {
    //       test: "Teeeeest",
    //     },
    //   },
    //   "fr-FR": {
    //     translation: {
    //       test: "Ouaaaiiisss",
    //     },
    //   },
    // },
    // lng: locales[0].languageCode || "en-US",
    lng: "en-US",
    // lng: savedLanguage || "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });
};

initI18n();

export default i18n;
