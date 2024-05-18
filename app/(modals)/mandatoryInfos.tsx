import { View } from "react-native";
import { View as ThemedView } from "@/components/Themed";
import React, { useEffect, useState } from "react";
import { Text, TextInput } from "@/components/Themed";
import { MMKV } from "@/app/_layout";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { padding } from "@/constants/values";
import { Picker } from "@react-native-picker/picker";
import ContainedButton from "@/components/ContainedButton";
import { useRouter } from "expo-router";
import { favelClient } from "@/lib/favelApi";

export default function mandatoryInfos() {
  const [infos, setInfos] = useState<{
    firstName: boolean;
    origin: boolean;
  } | null>(null);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      const data = MMKV.getString(`mandatoryInfos-${user.id}`);
      setInfos(JSON.parse(data));
    }
  }, []);

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [origin, setOrigin] = useState("none");

  function validate() {
    if (firstName.length > 0 && origin !== "none") {
      return false;
    } else {
      return true;
    }
  }

  const { getToken } = useAuth();

  function handleSave() {
    user?.update({
      firstName: firstName,
      lastName: lastName,
    });
    favelClient(getToken).then((favel) => {
      favel.updateUser(user!.id, {
        privateMetadata: {
          origin: origin,
        },
      });
    });

    user?.reload();

    router.back();
  }

  return (
    <ThemedView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: padding,
      }}
    >
      {/* <Text
        style={{
          fontSize: 14,
          fontFamily: "Outfit_600SemiBold",
          marginBottom: 20,
          textAlign: "center",
          opacity: 0.8,
        }}
      >
        Nous avons besoin de quelques informations supplémentaires vous
        concernant
      </Text> */}
      <View
        style={{
          padding: padding,
          gap: 10,
          width: "100%",
        }}
      >
        {(!user?.firstName || user?.firstName.length === 0) && (
          <>
            <Text>Prénom</Text>
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Prénom"
            />
            <Text>Nom de famille (optionnel)</Text>
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              placeholder="Nom de famille"
            />
          </>
        )}
        <Text>Comment avez-vous découvert Favel ?</Text>
        <Picker
          selectedValue={origin}
          onValueChange={(itemValue, itemIndex) => setOrigin(itemValue)}
        >
          <Picker.Item
            label="---"
            value="none"
          />
          <Picker.Item
            label="Publicité"
            value="ads"
          />
          <Picker.Item
            label="Bouche à oreille"
            value="bao"
          />
          <Picker.Item
            label="Réseaux Sociaux"
            value="social-media"
          />
          <Picker.Item
            label="Mail"
            value="mail"
          />
          <Picker.Item
            label="Autre"
            value="other"
          />
        </Picker>
      </View>
      <ContainedButton
        title="Enregistrer les informations"
        style={{
          opacity: validate() ? 0.5 : 1,
        }}
        disabled={validate() ? true : false}
        onPress={handleSave}
      />
    </ThemedView>
  );
}
