import {
  View,
  Pressable,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";
import React from "react";
import { Text } from "./Themed";
import Colors from "@/constants/Colors";
import { borderRadius } from "@/constants/values";

type ContainedButtonProps = TouchableOpacityProps & {
  title?: string;
  TitleComponent?: React.ReactNode;
  onPress: () => void;
  type?: "primary" | "ghost" | "ghostLight";
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  disabled?: boolean;
  backgroundStyle?: any;
};

const backgroundColors = {
  primary: Colors.light.accent,
  ghost: "transparent",
  ghostLight: "#083e4f1d",
};

const textColors = {
  primary: "#fff",
  ghost: "#fff",
  ghostLight: Colors.light.primary,
};

export default function ContainedButton(props: ContainedButtonProps) {
  const {
    onPress,
    title = "Sauvegarder",
    TitleComponent,
    style,
    type = "primary",
    fontSize = 16,
    fontFamily = "Outfit_600SemiBold",
    color = textColors[type],
    disabled,
    backgroundStyle,
    ...otherProps
  } = props;

  return (
    <TouchableOpacity
      style={[
        {
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 12,
          paddingHorizontal: 32,
          borderRadius: borderRadius,
          backgroundColor: backgroundColors[type],
          overflow: "hidden",
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.2}
      {...otherProps}
    >
      {type === "ghost" && (
        <View
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
            backgroundStyle,
          ]}
        />
      )}
      {TitleComponent ? (
        TitleComponent
      ) : title ? (
        <Text
          style={{
            color,
            fontSize,
            fontFamily,
            textAlign: "center",
          }}
        >
          {title}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}
