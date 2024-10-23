import { padding } from "@/constants/values";
import { View } from "../Themed";
import useTheme from "@/hooks/useTheme";
import Icon from "../Icon";
import Colors from "@/constants/Colors";

export default function TransportHeader() {
  const { theme } = useTheme();

  return (
    <View
      style={{
        height: 72,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
          height: 72,
          gap: 0,
          paddingVertical: 0,
          paddingHorizontal: padding,
        }}
      >
        <Icon
          icon="pedestrianIcon"
          size={22}
          strokeWidth={2}
          color={Colors[theme].text.primary}
          style={{
            opacity: 1,
          }}
        />
        <Icon
          icon="chevronLeftIcon"
          size={22}
          strokeWidth={2}
          color={Colors[theme].text.primary}
          style={{
            opacity: 0.8,
            transform: [{ rotate: "180deg" }],
          }}
        />
        <Icon
          icon="kickScooterIcon"
          size={22}
          strokeWidth={2}
          color={Colors[theme].text.primary}
          style={{
            opacity: 1,
          }}
        />
        <Icon
          icon="chevronLeftIcon"
          size={22}
          strokeWidth={2}
          color={Colors[theme].text.primary}
          style={{
            opacity: 0.8,
            transform: [{ rotate: "180deg" }],
          }}
        />
        <Icon
          icon="pedestrianIcon"
          size={22}
          strokeWidth={2}
          color={Colors[theme].text.primary}
          style={{
            opacity: 1,
          }}
        />
      </View>
      <View
        style={{
          position: "absolute",
          width: "100%",
          height: 1,
          backgroundColor: Colors[theme || "light"].text.primary,
          bottom: 0,
          opacity: 0.3,
        }}
      />
    </View>
  );
}
