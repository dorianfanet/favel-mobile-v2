import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar, View } from "react-native";

const PublicLayout = () => {
  useEffect(() => {
    StatusBar.setBarStyle("dark-content");
  });

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="login"
        options={{}}
      ></Stack.Screen>
      <Stack.Screen
        name="register"
        options={{
          headerTitle: "Créer un compte",
          headerShown: true,
          headerBackTitle: "Retour",
          headerTransparent: true,
        }}
      ></Stack.Screen>
      <Stack.Screen
        name="reset"
        options={{
          headerTitle: "Mot de passe oublié",
          headerShown: true,
          headerBackTitle: "Retour",
          headerTransparent: true,
        }}
      ></Stack.Screen>
    </Stack>
  );
};

export default PublicLayout;
