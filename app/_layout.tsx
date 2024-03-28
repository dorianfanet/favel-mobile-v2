import { Button, Text, View } from "@/components/Themed";
import { ActivityIndicator } from "react-native";
import {
  useFonts,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from "@expo-google-fonts/outfit";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";
import { Slot, Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import "react-native-gesture-handler";

function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    console.log("isSignedIn changed", isSignedIn, segments);
    if (!isLoaded) return;

    const inAuthPage = segments[0] === "(auth)";

    console.log(isSignedIn);

    if (isSignedIn && !inAuthPage) {
      router.replace("/(auth)/(tabs)/home");
    } else if (!isSignedIn) {
      router.replace("/(public)/login");
    }
  }, [isSignedIn]);

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
            headerLeft: () => (
              <Button
                title="Annuler"
                onPress={() => router.back()}
              />
            ),
            headerTransparent: true,
          }}
        />
        <Stack.Screen
          name="(modals)/travelCompanions"
          options={{
            presentation: "modal",
            title: "Compagnons de voyage",
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
          name="(auth)/(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(public)"
          options={{
            headerShown: false,
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
