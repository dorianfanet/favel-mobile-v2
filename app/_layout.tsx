import { Button, Text, View } from "@/components/Themed";
import { ActivityIndicator, Platform } from "react-native";
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
import CustomToast from "@/components/CustomToast";
import Toast from "react-native-toast-message";
import Constants from "expo-constants";
import { init } from "@amplitude/analytics-react-native";
import { usePushNotifications } from "@/lib/usePushNotifications";
import Application from "expo-application";
import { NotificationsProvider } from "@/context/notificationsContext";
import Colors from "@/constants/Colors";
import { supabaseClient } from "@/lib/supabaseClient";
import { MMKVLoader } from "react-native-mmkv-storage";

export const MMKV = new MMKVLoader().initialize();

const toastConfig = {
  custom: (props: any) => {
    console.log("custom toast props: ", props);
    return <CustomToast {...props} />;
  },
};

function InitialLayout() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const segments = useSegments();
  const router = useRouter();

  const { expoPushToken } = usePushNotifications();

  useEffect(() => {
    console.log("isSignedIn changed", isSignedIn, segments);
    if (!isLoaded) return;

    const inAuthPage = segments[0] === "(auth)";

    console.log(isSignedIn);

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

    if (isSignedIn && !inAuthPage) {
      try {
        init(process.env.EXPO_PUBLIC_AMPLITUDE_API_KEY!, user?.id);
      } catch (e) {
        console.log(e);
      }
      router.replace("/(auth)/(tabs)/home");
    } else if (!isSignedIn) {
      router.replace("/(public)/auth");
    }
  }, [isSignedIn, expoPushToken]);

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
          name="(modals)/editProfile"
          options={{
            presentation: "modal",
            title: "Modifier le profil",
            headerLeft:
              Platform.OS === "ios"
                ? () => (
                    <Button
                      title="Annuler"
                      onPress={() => router.back()}
                    />
                  )
                : undefined,
            headerTransparent: Platform.OS === "ios" ? true : false,
            headerBackground: () => (
              <View
                style={{
                  flex: 1,
                  backgroundColor: Colors.light.accent,
                }}
              />
            ),
            headerTintColor:
              Platform.OS === "ios" ? Colors.light.primary : "white",
          }}
        />
        <Stack.Screen
          name="(modals)/travelCompanions"
          options={{
            presentation: "modal",
            title: "Covoyageurs",
            headerRight: () => (
              <Button
                title="Fermer"
                onPress={() => router.back()}
              />
            ),
            headerTransparent: true,
          }}
        />
        <Stack.Screen
          name="(modals)/mandatoryInfos"
          options={{
            presentation: "modal",
            title: "Informations supplémentaires",
            headerTransparent: true,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="(modals)/share/[id]"
          options={{
            presentation: "modal",
            title: "Partager le voyage",
            headerTransparent: true,
          }}
        />
        <Stack.Screen
          name="(modals)/travelers/[id]"
          options={{
            presentation: "modal",
            title: "Voyageurs",
            headerStyle: {
              backgroundColor: Colors.light.accent,
            },
            headerTintColor: "white",
            headerRight:
              Platform.OS === "ios"
                ? () => {
                    return (
                      <Button
                        onPress={() => router.back()}
                        title="Fermer"
                        color="white"
                      />
                    );
                  }
                : undefined,
          }}
        />
        <Stack.Screen
          name="(modals)/follows/[...rest]"
          options={{
            presentation: "modal",
            title: "Abonnés",
            headerStyle: {
              backgroundColor: Colors.light.accent,
            },
            headerTintColor: "white",
            headerRight: () => {
              return Platform.OS === "ios" ? (
                <Button
                  onPress={() => router.back()}
                  title="Fermer"
                  color="white"
                />
              ) : null;
            },
          }}
        />
        <Stack.Screen
          name="(modals)/onboarding"
          options={{
            presentation: "modal",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(auth)/(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(auth)/conversation/[id]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(auth)/profile/[id]"
          options={{
            headerTitle: "Profile",
            headerBackground: () => (
              <View
                style={{
                  flex: 1,
                  backgroundColor: Colors.light.accent,
                }}
              />
            ),
            headerTintColor: "white",
            headerBackTitle: "Retour",
          }}
        />
        <Stack.Screen
          name="(auth)/post/[id]"
          options={{
            headerTitle: "Publication",
            headerBackground: () => (
              <View
                style={{
                  flex: 1,
                  backgroundColor: Colors.light.accent,
                }}
              />
            ),
            headerTintColor: "white",
            headerBackTitle: "Retour",
          }}
        />
        <Stack.Screen
          name="(public)"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
      <Toast
        config={toastConfig}
        topOffset={Constants.statusBarHeight}
      />
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
