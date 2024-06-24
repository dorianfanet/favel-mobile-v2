import { View, SafeAreaView, Alert, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import { Image } from "expo-image";
import { useUser } from "@clerk/clerk-expo";
import { Button, TextInput } from "@/components/Themed";
import * as ImagePicker from "expo-image-picker";
import { padding } from "@/constants/values";
import { View as ThemedView, Text } from "@/components/Themed";
import { usePathname, useRouter } from "expo-router";
import { MMKV } from "../_layout";

export default function editProfile() {
  const { user } = useUser();
  const [firstName, setFirstName] = useState(
    user && user.firstName ? user.firstName : ""
  );
  const [lastName, setLastName] = useState(
    user && user.lastName ? user!.lastName : ""
  );
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const pathname = usePathname();
  console.log(pathname);

  const pickImageAsync = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 1,
        base64: true,
      });

      if (!result.canceled) {
        setLoading(true);
        user!
          .setProfileImage({
            file: `data:image/jpeg;base64,${result.assets[0].base64}`,
          })
          .then((res) => {
            console.log(res);
            setLoading(false);
            router.back();
          })
          .catch((e) => {
            console.log(e.errors);
            setLoading(false);
            Alert.alert("Error updating profile image");
          });
      } else {
        alert("Vous n'avez pas sélectionné d'image.");
      }
    } catch (E) {
      console.log(E);
    }
  };

  const onSaveUser = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const result = await user.update({
        firstName,
        lastName,
      });
      setLoading(false);
      user.reload();
      const cache = MMKV.getString(`user-${user.id}`);
      MMKV.setStringAsync(
        `user-${user.id}`,
        JSON.stringify({
          data: {
            ...JSON.parse(cache).data,
            firstName: firstName,
            lastName: lastName,
          },
          expiresAt: new Date().getTime() + 720000,
        })
      );
      router.back();
    } catch (e) {
      setLoading(false);
      Alert.alert(
        "Une erreur s'est produite lors de la mise à jour de votre profil. Veuillez réessayer plus tard."
      );
    }
  };

  return (
    <ThemedView
      style={{
        flex: 1,
        position: "relative",
        backgroundColor: "white",
      }}
    >
      <SafeAreaView>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            gap: 20,
            marginVertical: 40,
          }}
        >
          {user && user.imageUrl && (
            <Image
              source={{ uri: user!.imageUrl }}
              style={{ width: 100, height: 100, borderRadius: 50 }}
            />
          )}
          <Button
            title="Sélectionner une image"
            onPress={pickImageAsync}
          />
        </View>
        <View
          style={{
            padding: padding,
            gap: 10,
          }}
        >
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
        </View>
        <Button
          title="Enregistrer les modifications"
          onPress={() => {
            onSaveUser();
          }}
        />
      </SafeAreaView>
      {loading && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator
            size="large"
            color="#fff"
          />
        </View>
      )}
    </ThemedView>
  );
}
