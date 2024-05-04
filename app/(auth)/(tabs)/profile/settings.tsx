import React from "react";
import { useRouter } from "expo-router";
import { Text, View } from "@/components/Themed";
import { borderRadius, padding } from "@/constants/values";
import { Alert, StyleSheet, TouchableOpacity } from "react-native";
import Colors from "@/constants/Colors";
import { favel } from "@/lib/favelApi";
import { useAuth, useUser } from "@clerk/clerk-expo";
import MenuTitle from "@/components/menu/MenuTitle";
import MenuWrapper from "@/components/menu/MenuWrapper";
import MenuButton from "@/components/menu/MenuButton";

export default function settings() {
  const router = useRouter();

  const { user } = useUser();
  const { signOut } = useAuth();

  const handleDeleteAccount = async () => {
    favel.deleteUser(user!.id);
    await signOut();
  };

  const showConfirmationDialog = () => {
    Alert.alert(
      "Supprimer le compte",
      "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.",
      [
        {
          text: "Oui",
          onPress: () => {
            handleDeleteAccount();
          },
          style: "destructive",
        },
        {
          text: "Non",
          onPress: () => {},
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View
      style={{
        flex: 1,
        padding: padding,
      }}
    >
      <MenuTitle title="Compte" />
      <MenuWrapper>
        <MenuButton
          title="Modifier le profil"
          onPress={() => {
            router.navigate("/(modals)/editProfile");
          }}
        />
        <MenuButton
          title="Supprimer le compte"
          onPress={showConfirmationDialog}
          destructive
        />
      </MenuWrapper>
      <MenuTitle title="Paramètres de l'application" />
      <MenuWrapper>
        <MenuButton
          title="Notifications"
          onPress={() => {
            router.navigate("/profile/notifications");
          }}
        />
      </MenuWrapper>
      <MenuTitle title="Connexion" />
      <MenuWrapper>
        <MenuButton
          title="Se déconnecter"
          onPress={() => signOut()}
        />
      </MenuWrapper>
    </View>
  );
}
