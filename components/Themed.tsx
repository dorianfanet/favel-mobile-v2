import Colors from "@/constants/Colors";
import {
  ViewProps as DefaultViewProps,
  View as DefaultView,
  useColorScheme,
  TextProps as DefaultTextProps,
  Text as DefaultText,
  StyleSheet,
  TouchableOpacityProps as DefaultTouchableOpacityProps,
  TouchableOpacity as DefaultTouchableOpacity,
} from "react-native";
import { Image } from "expo-image";

export function useThemeColor(props: { light?: string; dark?: string }) {
  const theme = useColorScheme();
  const colorFromProps = props[theme || "light"];

  return colorFromProps;
}

interface ViewProps extends DefaultViewProps {
  background?: "primary" | "secondary";
}

export function View(props: ViewProps) {
  const { style, background, ...otherProps } = props;

  const backgroundColor = useThemeColor({
    light: Colors.light.background[background || "primary"],
    dark: Colors.dark.background[background || "primary"],
  });

  return (
    <DefaultView
      style={[
        { backgroundColor: props.background ? backgroundColor : "transparent" },
        style,
      ]}
      {...otherProps}
    />
  );
}

export function BackgroundView(props: DefaultViewProps) {
  const { style, ...otherProps } = props;
  const backgroundColor = useThemeColor({
    light: Colors.light.background.primary,
    dark: Colors.dark.background.primary,
  });

  return (
    <DefaultView
      style={[{ backgroundColor: backgroundColor }, style]}
      {...otherProps}
    >
      <DefaultView
        style={{
          flex: 1,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
        }}
      >
        <Image
          source={require("@/assets/images/iceland.png")}
          cachePolicy={"disk"}
          style={{
            width: "100%",
            height: "100%",
          }}
        />
      </DefaultView>
      {props.children}
    </DefaultView>
  );
}

const fontStyles = {
  title: {
    fontSize: 24,
    fontFamily: "Outfit_700Bold",
  },
  subtitle: {
    fontSize: 18,
    fontFamily: "Outfit_600SemiBold",
  },
  body: {
    fontSize: 14,
    fontFamily: "Outfit_500Medium",
  },
  caption: {
    fontSize: 12,
    fontFamily: "Outfit_400Regular",
  },
  button: {
    fontSize: 16,
    fontFamily: "Outfit_500Medium",
  },
};

interface TextProps extends DefaultTextProps {
  fontStyle?: keyof typeof fontStyles;
}

export function Text(props: TextProps) {
  const { style, fontStyle = "body", ...otherProps } = props;

  const color = useThemeColor({
    light: Colors.light.text.primary,
    dark: Colors.dark.text.primary,
  });

  // Merge the selected font style with the passed style
  const textStyle = StyleSheet.flatten([
    { color },
    fontStyles[fontStyle], // Apply font style from the mapping
    style,
  ]);

  return (
    <DefaultText
      style={textStyle}
      {...otherProps}
    />
  );
}

interface ButtonProps extends DefaultTouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "medium" | "large";
}

export function Button(props: ButtonProps) {
  const { style, variant = "primary", ...otherProps } = props;

  const colorScheme = useColorScheme();
  const theme = colorScheme === "light" ? "light" : "dark";

  const getButtonStyles = (
    theme: "light" | "dark",
    variant: "primary" | "secondary" | "outline" | "ghost"
  ) => {
    const reverseTheme = theme === "light" ? "dark" : "light";

    const styles = {
      primary: {
        backgroundColor: Colors[theme].button.primary,
        textColor: Colors[reverseTheme].text.primary,
        borderColor: "transparent",
      },
      secondary: {
        backgroundColor: Colors[theme].button.secondary,
        textColor: Colors[theme].text.primary,
        borderColor: "transparent",
      },
      outline: {
        backgroundColor: "transparent",
        textColor: Colors[theme].text.primary,
        borderColor: Colors[theme].button.primary,
      },
      ghost: {
        backgroundColor: "transparent",
        textColor: Colors[theme].text.primary,
        borderColor: "transparent",
      },
    };

    return styles[variant];
  };

  const themeStyles = {
    light: getButtonStyles("light", variant),
    dark: getButtonStyles("dark", variant),
  };

  const sizeStyles = {
    medium: {
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 16,
    },
    large: {
      paddingVertical: 14,
      paddingHorizontal: 18,
      borderRadius: 20,
    },
  };

  return (
    <DefaultTouchableOpacity
      style={[
        {
          backgroundColor: themeStyles[theme].backgroundColor,
          borderColor: themeStyles[theme].borderColor,
          borderWidth: variant === "outline" ? 1 : 0,
          paddingVertical: sizeStyles[props.size || "medium"].paddingVertical,
          paddingHorizontal:
            sizeStyles[props.size || "medium"].paddingHorizontal,
          borderRadius: sizeStyles[props.size || "medium"].borderRadius,
        },
        style,
      ]}
      {...otherProps}
    >
      <Text
        fontStyle="button"
        style={{
          color: themeStyles[theme].textColor,
          textAlign: "center",
        }}
      >
        {props.title}
      </Text>
    </DefaultTouchableOpacity>
  );
}
