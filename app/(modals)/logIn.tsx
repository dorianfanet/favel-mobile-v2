import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { useSignIn } from "@clerk/clerk-expo";
import React, { useState } from "react";
import { ActivityIndicator, TextInput, TouchableOpacity } from "react-native";

export default function logIn() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSignInPress = async () => {
    if (!isLoaded) {
      return;
    }
    setLoading(true);
    try {
      const completeSignIn = await signIn.create({
        identifier: emailAddress,
        password,
      });

      await setActive({ session: completeSignIn.createdSessionId });
    } catch (err: any) {
      alert(err.errors[0].message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      background="primary"
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <TextInput
        autoCapitalize="none"
        placeholder="Email"
        value={emailAddress}
        onChangeText={setEmailAddress}
        placeholderTextColor={"#083E4F8b"}
        autoComplete="email"
      />
      <TextInput
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor={"#083E4F8b"}
        autoComplete="password"
      />

      <TouchableOpacity onPress={onSignInPress}>
        {loading ? (
          <ActivityIndicator color={"white"} />
        ) : (
          <Text
            style={{
              color: "#fff",
              fontFamily: "Outfit_600SemiBold",
            }}
          >
            Se connecter
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
