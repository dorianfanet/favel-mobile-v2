import React from "react";
import { Text, View } from "@/components/Themed";
import { padding } from "@/constants/values";
import MenuTitle from "@/components/menu/MenuTitle";
import MenuWrapper from "@/components/menu/MenuWrapper";
import MenuButton from "@/components/menu/MenuButton";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { MMKV } from "@/app/_layout";

type Language = {
  title: string;
  value: string;
};

const languages: Language[] = [
  {
    title: "Français",
    value: "fr",
  },
  {
    title: "Anglais",
    value: "en",
  },
];

export default function Language() {
  const { i18n, t } = useTranslation();
  const router = useRouter();

  const [language, setLanguage] = React.useState(i18n.language);

  function handleLanguageChange(lang: Language) {
    setLanguage(lang.value);
    i18n.changeLanguage(lang.value);
    MMKV.setString("language", lang.value);
    router.navigate("/(auth)/(tabs)/home");
  }

  return (
    <View
      style={{
        flex: 1,
        padding: padding,
      }}
    >
      <MenuWrapper>
        {languages.map((lang) => (
          <MenuButton
            key={lang.value}
            title={lang.title}
            type="select"
            value={lang.value === language ? "selected" : undefined}
            onPress={() => handleLanguageChange(lang)}
          />
        ))}
      </MenuWrapper>
    </View>
  );
}
