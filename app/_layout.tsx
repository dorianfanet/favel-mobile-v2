import { Button, Text, View } from "@/components/Themed";
import { ActivityIndicator } from "react-native";
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
import Intercom from "@intercom/intercom-react-native";
import { init } from "@amplitude/analytics-react-native";

const toastConfig = {
  custom: (props: any) => {
    console.log("custom toast props: ", props);
    return <CustomToast {...props} />;
  },
};

function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    console.log("isSignedIn changed", isSignedIn, segments);
    if (!isLoaded) return;

    const inAuthPage = segments[0] === "(auth)";

    console.log(isSignedIn);

    if (isSignedIn && !inAuthPage) {
      try {
        Intercom.loginUserWithUserAttributes({
          email: user?.primaryEmailAddress?.emailAddress,
          userId: user?.id,
        });
      } catch (e) {
        console.log(e);
      }
      try {
        init(process.env.EXPO_PUBLIC_AMPLITUDE_API_KEY!, user?.id);
      } catch (e) {
        console.log(e);
      }
      router.replace("/(auth)/(tabs)/home");
    } else if (!isSignedIn) {
      router.replace("/(public)/auth");
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
