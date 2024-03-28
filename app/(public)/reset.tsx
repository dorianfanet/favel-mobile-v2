import { StyleSheet, TextInput, Button, Pressable } from "react-native";
import React, { useState } from "react";
import { Stack } from "expo-router";
import { useSignIn } from "@clerk/clerk-expo";
import { Text, View } from "@/components/Themed";
import { logInStyles } from "./login";
import Colors from "@/constants/Colors";

const PwReset = () => {
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [successfulCreation, setSuccessfulCreation] = useState(false);
  const { signIn, setActive } = useSignIn();

  // Request a passowrd reset code by email
  const onRequestReset = async () => {
    if (!signIn) return;
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: emailAddress,
      });
      setSuccessfulCreation(true);
    } catch (err: any) {
      alert(err.errors[0].message);
    }
  };

  // Reset the password with the code and the new password
  const onReset = async () => {
    if (!signIn) return;
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });
      console.log(result);
      alert("Password reset successfully");

      // Set the user session active, which will log in the user automatically
      await setActive({ session: result.createdSessionId });
    } catch (err: any) {
      alert(err.errors[0].message);
    }
  };

  return (
    <View style={logInStyles.container}>
      <Stack.Screen options={{ headerBackVisible: !successfulCreation }} />

      {!successfulCreation && (
        <>
          <TextInput
            autoCapitalize="none"
            placeholder="Email"
            value={emailAddress}
            onChangeText={setEmailAddress}
            style={logInStyles.inputField}
            placeholderTextColor={"#083E4F8b"}
          />

          <Pressable
            onPress={onRequestReset}
            style={logInStyles.button}
          >
            <Text
              style={{
                color: "#fff",
                fontFamily: "Outfit_600SemiBold",
              }}
            >
              Envoyer
            </Text>
          </Pressable>
        </>
      )}

      {successfulCreation && (
        <>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Outfit_600SemiBold",
              marginBottom: 20,
              textAlign: "center",
              opacity: 0.8,
            }}
          >
            Nous vous avons envoyé un code de réinitialisation par email.
            Veuillez le saisir ci-dessous pour définir un nouveau mot de passe.
          </Text>
          <View>
            <TextInput
              value={code}
              placeholder="Code"
              style={logInStyles.inputField}
              onChangeText={setCode}
              placeholderTextColor={"#083E4F8b"}
            />
            <TextInput
              placeholder="Nouveau mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={logInStyles.inputField}
              placeholderTextColor={"#083E4F8b"}
            />
          </View>
          <Pressable
            onPress={onReset}
            style={logInStyles.button}
          >
            <Text
              style={{
                color: "#fff",
                fontFamily: "Outfit_600SemiBold",
              }}
            >
              Réinitialiser le mot de passe
            </Text>
          </Pressable>
        </>
      )}
    </View>
  );
};

export default PwReset;
