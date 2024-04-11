import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar, View } from "react-native";

const PublicLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="auth"
        options={{}}
      />
      <Stack.Screen
        name="login"
        options={{
          headerTitle: "Se connecter",
          headerShown: true,
          headerBackTitle: "Retour",
          headerTransparent: true,
        }}
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
