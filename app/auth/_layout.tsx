import { Button, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { padding } from "@/constants/values";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Layout() {
  const inset = useSafeAreaInsets();

  const { t } = useTranslation();

  const router = useRouter();

  return (
    <View
      background="primary"
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View
        style={{
          position: "absolute",
          top: inset.top + 20,
        }}
      >
        <Image
          source={require("../../assets/images/logo-full.png")}
          style={{
            width: 220,
            height: 52,
          }}
        />
      </View>
      <View
        style={{
          width: "100%",
          paddingHorizontal: padding,
          position: "absolute",
          bottom: inset.bottom + 20,
          gap: 20,
        }}
      >
        <Button
          size="large"
          variant="primary"
          title={t("createNewTrip")}
          onPress={() => {}}
          style={{
            width: "100%",
            backgroundColor: Colors.light.accent,
            shadowColor: Colors.light.accent,
            shadowOffset: {
              width: 0,
              height: 0,
            },
            shadowOpacity: 0.5,
            shadowRadius: 20,
            elevation: 20,
          }}
        />
        <Button
          size="large"
          variant="ghost"
          title={t("alreadyHaveAccount")}
          onPress={() => {
            router.push("/(modals)/logIn");
          }}
        />
      </View>
    </View>
  );
}
