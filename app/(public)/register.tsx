import { Button, StyleSheet, ActivityIndicator, Pressable } from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { useState } from "react";
import { Stack } from "expo-router";
import { Text, TextInput, View } from "@/components/Themed";
import { logInStyles } from "./login";

const Register = () => {
  const { isLoaded, signUp, setActive } = useSignUp();

  const [firstName, setFirstName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");

  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  // Create the user and send the verification email
  const onSignUpPress = async () => {
    if (!isLoaded) {
      return;
    }
    setLoading(true);

    try {
      // Create the user on Clerk
      await signUp.create({
        firstName,
        emailAddress,
        password,
      });

      // Send verification Email
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // change the UI to verify the email address
      setPendingVerification(true);
    } catch (err: any) {
      alert(err.errors[0].message);
    } finally {
      setLoading(false);
    }
  };

  // Verify the email address
  const onPressVerify = async () => {
    if (!isLoaded) {
      return;
    }
    setLoading(true);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      await setActive({ session: completeSignUp.createdSessionId });
    } catch (err: any) {
      alert(err.errors[0].message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={logInStyles.container}>
      <Stack.Screen options={{ headerBackVisible: !pendingVerification }} />
      {loading && (
        <ActivityIndicator
          size="large"
          color="#6c47ff"
        />
      )}

      {!pendingVerification && (
        <>
          <TextInput
            autoCapitalize="none"
            placeholder="Prénom"
            value={firstName}
            onChangeText={setFirstName}
            placeholderTextColor={"#083E4F8b"}
          />
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

          <Pressable
            onPress={onSignUpPress}
            style={logInStyles.button}
          >
            <Text
              style={{
                color: "#fff",
                fontFamily: "Outfit_600SemiBold",
              }}
            >
              Créer un compte
            </Text>
          </Pressable>
        </>
      )}

      {pendingVerification && (
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
            Nous vous avons envoyé un code de vérification par email. Veuillez
            le saisir ci-dessous.
          </Text>
          <View>
            <TextInput
              value={code}
              placeholder="Code..."
              style={logInStyles.inputField}
              onChangeText={setCode}
            />
          </View>

          <Pressable
            onPress={onPressVerify}
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
    </View>
  );
};

export default Register;
