import { View, Text, Pressable } from "react-native";
import React, { useCallback } from "react";
import { Stack, useRouter } from "expo-router";
import { padding } from "@/constants/values";
import Colors from "@/constants/Colors";
import Icon from "@/components/Icon";
import { TouchableOpacity } from "react-native-gesture-handler";

export default function ProfileLayout() {
  const router = useRouter();

  const renderHeaderBackground = useCallback(() => {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.light.accent,
        }}
      />
    );
  }, []);

  return (
    <Stack
      screenOptions={{
        title: "",
        headerBackground: renderHeaderBackground,
        headerTitleStyle: {
          fontFamily: "Outfit_600SemiBold",
          fontSize: 18,
          color: "#fff",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Profil",
          // headerLeft: () => (
          //   <View
          //     style={{
          //       flexDirection: "row",
          //       alignItems: "center",
          //       gap: 10,
          //       backgroundColor: Colors.light.accent,
          //     }}
          //   >
          //     <Text
          //       style={{
          //         fontSize: 18,
          //         fontFamily: "Outfit_600SemiBold",
          //         color: "#fff",
          //       }}
          //     >
          //       Profil
          //     </Text>
          //   </View>
          // ),
          headerRight: () => (
            <Pressable
              style={{
                backgroundColor: "transparent",
              }}
              onPress={() => router.navigate("/profile/settings")}
            >
              <Icon
                icon={"settingsIcon"}
                size={24}
                color={"#fff"}
              />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: "Paramètres",
          headerTitleStyle: {
            fontFamily: "Outfit_600SemiBold",
            fontSize: 18,
            color: "#fff",
          },
          headerTintColor: "#fff",
          headerBackTitle: "Retour",
        }}
      />
      <Stack.Screen
        name="language"
        options={{
          title: "Language",
          headerTitleStyle: {
            fontFamily: "Outfit_600SemiBold",
            fontSize: 18,
            color: "#fff",
          },
          headerTintColor: "#fff",
          headerBackTitle: "Retour",
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          title: "Notifications",
          headerTitleStyle: {
            fontFamily: "Outfit_600SemiBold",
            fontSize: 18,
            color: "#fff",
          },
          headerTintColor: "#fff",
          headerBackTitle: "Retour",
        }}
      />
    </Stack>
  );
}
