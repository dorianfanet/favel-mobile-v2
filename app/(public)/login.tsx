import { Text, TextInput, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { useWarmUpBrowser } from "@/hooks/useWarmUpBrowser";
import { useOAuth, useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Button,
  Pressable,
  Alert,
  TouchableOpacity,
  StatusBar,
} from "react-native";

enum Strategy {
  Google = "oauth_google",
  Apple = "oauth_apple",
}

export default function login() {
  const { signIn, setActive, isLoaded } = useSignIn();

  useEffect(() => {
    StatusBar.setBarStyle("dark-content");
  });

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

      // This indicates the user is signed in
      await setActive({ session: completeSignIn.createdSessionId });
    } catch (err: any) {
      alert(err.errors[0].message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={logInStyles.container}>
      <Text
        style={{
          fontSize: 14,
          fontFamily: "Outfit_600SemiBold",
          marginBottom: 20,
          textAlign: "center",
          opacity: 0.8,
        }}
      >
        Connectez-vous pour continuer
      </Text>
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

      <Link
        href="/reset"
        asChild
      >
        <Pressable>
          <Text
            style={{
              color: Colors.light.primary,
              fontFamily: "Outfit_600SemiBold",
              textAlign: "center",
              marginVertical: 10,
            }}
          >
            Mot de passe oublié ?
          </Text>
        </Pressable>
      </Link>

      <Pressable
        onPress={onSignInPress}
        style={logInStyles.button}
      >
        <Text
          style={{
            color: "#fff",
            fontFamily: "Outfit_600SemiBold",
          }}
        >
          Se connecter
        </Text>
      </Pressable>

      <Link
        href="/register"
        asChild
      >
        <Pressable
          style={{
            position: "absolute",
            bottom: 30,
            width: "100%",
            left: 20,
          }}
        >
          <Text
            style={{
              color: Colors.light.primary,
              fontFamily: "Outfit_600SemiBold",
              textAlign: "center",
              marginVertical: 10,
            }}
          >
            Créer un compte
          </Text>
        </Pressable>
      </Link>
    </View>
  );
}

export const logInStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  inputField: {
    marginVertical: 8,
    height: 60,
    borderRadius: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#2f2f2f5d",
    shadowColor: "#030731",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  button: {
    marginTop: 20,
    alignItems: "center",
    backgroundColor: Colors.light.accent,
    padding: 10,
    paddingHorizontal: 40,
    alignSelf: "center",
    borderRadius: 20,
  },
  or: {
    flex: 1,
    height: 3,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
  },
  providers: {
    justifyContent: "center",
    alignItems: "center",
  },
});
