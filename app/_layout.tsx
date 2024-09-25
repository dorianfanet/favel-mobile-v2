import { ActivityIndicator, Platform, View } from "react-native";
import {
  useFonts,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from "@expo-google-fonts/outfit";
import { ClerkProvider, useAuth, useUser } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";
import { Slot, Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import Constants from "expo-constants";
import { init } from "@amplitude/analytics-react-native";
import { usePushNotifications } from "@/lib/usePushNotifications";
import Colors from "@/constants/Colors";
import { supabaseClient } from "@/lib/supabaseClient";
import { MMKVLoader } from "react-native-mmkv-storage";
import "@/i18n";
import { useTranslation } from "react-i18next";

// LogBox.ignoreLogs(["Warning: ..."]); // Ignore log notification by message
// LogBox.ignoreAllLogs();

export const MMKV = new MMKVLoader().initialize();

function InitialLayout() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { t } = useTranslation();

  const { expoPushToken } = usePushNotifications();

  useEffect(() => {
    if (!isLoaded) return;

    async function updatePushToken() {
      if (!expoPushToken || !user) return;
      await supabaseClient(getToken).then(async (supabase) => {
        const { data, error } = await supabase
          .from("push_tokens")
          .select("id, user_id, expo_push_token")
          .eq("key", `${user?.id}-${expoPushToken.data}`);

        if (error) {
          console.error("Error fetching push token", error);
          return;
        }

        console.log("Push token data", data, expoPushToken.data, user?.id);

        if (data.length > 0) {
          console.log("Push token already exists for user and device");
          return;
        } else {
          const { error } = await supabase.from("push_tokens").insert({
            user_id: user?.id,
            expo_push_token: expoPushToken.data,
            key: `${user?.id}-${expoPushToken.data}`,
          });

          if (error) {
            console.error("Error inserting push token", error);
          }
        }
      });

      MMKV.setString("expoPushToken", expoPushToken.data);
    }

    console.log("expoPushToken", expoPushToken);
    if (expoPushToken) {
      updatePushToken();
    }

    if (isSignedIn) {
      try {
        init(process.env.EXPO_PUBLIC_AMPLITUDE_API_KEY!, user?.id);
      } catch (e) {
        console.log(e);
      }
      router.replace("../home");
    } else if (!isSignedIn) {
      router.replace("../auth");
    }
  }, [isLoaded]);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen
          name="auth"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="home"
          options={{
            headerShown: false,
          }}
        />
        {/* <Stack.Screen
          name="trip"
          options={{
            headerShown: false,
          }}
        /> */}

        {/* modals */}
        <Stack.Screen
          name="(modals)/logIn"
          options={{
            title: t("login"),
            presentation: "modal",
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  let [fontsLoaded, fontError] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
      <InitialLayout />
    </ClerkProvider>
  );
}

const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};
