import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Text, View } from "@/components/Themed";
import { borderRadius, padding } from "@/constants/values";
import { Alert, StyleSheet, TouchableOpacity } from "react-native";
import Colors from "@/constants/Colors";
import { useAuth, useUser } from "@clerk/clerk-expo";
import MenuTitle from "@/components/menu/MenuTitle";
import MenuWrapper from "@/components/menu/MenuWrapper";
import MenuButton from "@/components/menu/MenuButton";
import { MMKV } from "@/app/_layout";
import { supabaseClient } from "@/lib/supabaseClient";
import { favelClient } from "@/lib/favelApi";

export default function settings() {
  const router = useRouter();

  const { user } = useUser();
  const { signOut } = useAuth();

  const { getToken } = useAuth();

  const handleDeleteAccount = async () => {
    favelClient(getToken).then((favel) => favel.deleteUser(user!.id));
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
        <NotificationsButton />
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

function NotificationsButton() {
  const [value, setValue] = useState<boolean | null>(null);

  useEffect(() => {
    const cache = MMKV.getString("notifications_preferences");
    console.log(cache);

    if (cache) {
      setValue(cache === "enabled");
    } else {
      MMKV.setString("notifications_preferences", "enabled");
      setValue(true);
    }

    const pushToken = MMKV.getString("expoPushToken");
    if (!pushToken) return;

    async function checkNotificationsPreferences() {
      if (!user) return;
      await supabaseClient(getToken).then(async (supabase) => {
        const { data, error } = await supabase
          .from("notifications_preferences")
          .select("main")
          .eq("push_token_key", `${user.id}-${pushToken}`);

        if (error) {
          console.error(error);
          return;
        }

        if (data && "main" in data[0]) {
          setValue(data[0].main);
          return;
        }
      });
    }

    checkNotificationsPreferences();
  }, []);

  const { user } = useUser();
  const { getToken } = useAuth();

  return value !== null ? (
    <MenuButton
      title="Notifications"
      type="switch"
      externalValue={value}
      onValueChange={async (value) => {
        setValue(value);
        if (!user) return;
        const pushToken = MMKV.getString("expoPushToken");
        if (!pushToken) return;

        await supabaseClient(getToken).then(async (supabase) => {
          const { data, error } = await supabase
            .from("notifications_preferences")
            .upsert({
              push_token_key: `${user.id}-${pushToken}`,
              updated_at: new Date(),
              user_id: user.id,
              main: value,
            })
            .eq("push_token_key", `${user.id}-${pushToken}`);

          if (error) {
            console.error(error);
            setValue(!value);
            return;
          }
        });

        MMKV.setString(
          "notifications_preferences",
          value ? "enabled" : "disabled"
        );
      }}
    />
  ) : null;
}
