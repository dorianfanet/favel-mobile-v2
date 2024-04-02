import {
  Text as DefaultText,
  View as DefaultView,
  Button as DefaultButton,
  TextInput as DefaultTextInput,
  Platform,
  useColorScheme,
} from "react-native";
import { BlurView as DefaultBlurView } from "expo-blur";
import Colors from "../constants/Colors";
import { BlurViewProps } from "expo-blur";
import { forwardRef } from "react";

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.dark
) {
  const theme = useColorScheme();
  const colorFromProps = props[theme || "light"];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme || "light"][colorName];
  }
}

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText["props"];
export type ViewProps = ThemeProps & DefaultView["props"];
export type ButtonProps = ThemeProps & DefaultButton["props"];
export type TextInputProps = ThemeProps & DefaultTextInput["props"];

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  // const color = useThemeColor(
  //   { light: lightColor, dark: darkColor },
  //   "primary"
  // );

  return (
    <DefaultText
      style={[
        { color: Colors.light.primary, fontFamily: "Outfit_400Regular" },
        style,
      ]}
      {...otherProps}
    />
  );
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  // const backgroundColor = useThemeColor(
  //   { light: lightColor, dark: darkColor },
  //   "background"
  // );

  return (
    <DefaultView
      style={[{ backgroundColor: Colors.light.background }, style]}
      {...otherProps}
    />
  );
}

export function Button(props: ButtonProps) {
  // const backgroundColor = useThemeColor(
  //   { light: lightColor, dark: darkColor },
  //   "background"
  // );

  return (
    <DefaultButton
      color={Colors.light.accent}
      {...props}
    />
  );
}

export function TextInput(props: TextInputProps) {
  const { style, ...otherProps } = props;
  // const color = useThemeColor(
  //   { light: lightColor, dark: darkColor },
  //   "primary"
  // );

  return (
    <DefaultTextInput
      style={[
        {
          fontFamily: "Outfit_400Regular",
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
          // fontFamily: "Outfit_400Regular",
          // marginVertical: 8,
          // height: 60,
          // borderRadius: 20,
          // padding: 15,
          // backgroundColor: "#fff",
        },
        style,
      ]}
      {...otherProps}
    />
  );
}

export const BlurView = forwardRef<typeof View, BlurViewProps>((props, ref) => {
  const { style, ...otherProps } = props;

  return Platform.OS === "ios" ? (
    <DefaultBlurView
      ref={ref as any}
      intensity={40}
      tint="dark"
      style={[
        {
          flex: 1,
          padding: 0,
          margin: 0,
          justifyContent: "center",
          overflow: "hidden",
          borderRadius: 20,
          opacity: 1,
          // backgroundColor: "#5d9bd5b9",
          backgroundColor: "#0d4376b8",
        },
        style,
      ]}
      {...otherProps}
    />
  ) : (
    <View
      style={{
        flex: 1,
        padding: 0,
        margin: 0,
        justifyContent: "center",
        overflow: "hidden",
        borderRadius: 20,
        opacity: 1,
        backgroundColor: "#2e648b",
      }}
      {...props}
    />
  );
});
