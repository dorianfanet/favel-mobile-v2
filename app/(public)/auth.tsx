import {
  View,
  StatusBar,
  Pressable,
  Touchable,
  TouchableOpacity,
  Platform,
  Linking,
} from "react-native";
import React, { useEffect } from "react";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Link, LinkProps, useRouter } from "expo-router";
import Icon, { IconProps } from "@/components/Icon";
import { padding } from "@/constants/values";
import { Text } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { useWarmUpBrowser } from "@/hooks/useWarmUpBrowser";
import { useOAuth } from "@clerk/clerk-expo";
import ContainedButton from "@/components/ContainedButton";

enum Strategy {
  Google = "oauth_google",
  Apple = "oauth_apple",
}

export default function Auth() {
  useEffect(() => {
    StatusBar.setBarStyle("light-content");
  });

  const inset = useSafeAreaInsets();

  useWarmUpBrowser();

  const router = useRouter();
  const { startOAuthFlow: googleAuth } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: appleAuth } = useOAuth({ strategy: "oauth_apple" });

  const onSelectAuth = async (strategy: Strategy) => {
    const selectedAuth = {
      [Strategy.Google]: googleAuth,
      [Strategy.Apple]: appleAuth,
    }[strategy];

    try {
      const { createdSessionId, setActive } = await selectedAuth();

      if (createdSessionId) {
        setActive!({ session: createdSessionId });
        router.back();
      }
    } catch (err) {
      console.log("OAuth error", JSON.stringify(err));
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
      }}
    >
      <View
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
      >
        <Image
          source={require("../../assets/images/auth-background.png")}
          style={{
            width: "100%",
            height: "100%",
          }}
        />
      </View>
      <View
        style={{
          position: "absolute",
          top: inset.top + 20,
        }}
      >
        <Image
          source={require("../../assets/images/logo-full.png")}
          style={{
            width: 220,
            height: 52,
          }}
        />
      </View>
      <View
        style={{
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 40,
          gap: 15,
        }}
      >
        {Platform.OS === "ios" && (
          <Button
            href="/login"
            title="Continuer avec Apple"
            imageUri={require("../../assets/icons/apple.png")}
            onPress={() => onSelectAuth(Strategy.Apple)}
          />
        )}
        <Button
          href="/login"
          title="Continuer avec Google"
          imageUri={require("../../assets/icons/google.webp")}
          onPress={() => onSelectAuth(Strategy.Google)}
        />
        <Button
          href="/login"
          title="Continuer par mail"
          icon="mailIcon"
          secondary
          onPress={() => router.push("/login")}
        />
      </View>
      {/* external link to website */}
      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: inset.bottom + padding,
          left: padding,
          right: padding,
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={() => Linking.openURL("https://www.favel.net/privacy-policy")}
      >
        <View
          style={{
            backgroundColor: "#2424244f",
            borderRadius: 15,
            padding: 10,
            paddingVertical: 5,
          }}
        >
          <Text
            style={{
              fontFamily: "Outfit_500Medium",
              fontSize: 14,
              color: Colors.dark.primary,
            }}
          >
            Politique de confidentialité
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

function Button({
  href,
  title,
  imageUri,
  icon,
  secondary,
  onPress,
}: {
  href: LinkProps<any>["href"];
  title: string;
  imageUri?: string;
  icon?: IconProps["icon"];
  secondary?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={{
        height: 42,
        width: "100%",
        backgroundColor: "white",
        borderRadius: 15,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        gap: 10,
        opacity: secondary ? 1 : 1,
      }}
      onPress={onPress}
    >
      <View
        style={{
          position: "absolute",
          left: 12,
        }}
      >
        {imageUri && (
          <Image
            source={imageUri}
            style={{
              width: 18,
              height: 18,
            }}
            contentFit="contain"
          />
        )}
        {icon && (
          <Icon
            icon={icon}
            size={18}
            color={Colors.light.primary}
          />
        )}
      </View>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontFamily: "Outfit_500Medium",
            fontSize: 14,
          }}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
