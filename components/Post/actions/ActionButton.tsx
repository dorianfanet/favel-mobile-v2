import { TouchableOpacity, View } from "react-native";
import Icon, { IconProps } from "../../Icon";
import Colors from "@/constants/Colors";
import { Text } from "../../Themed";

export default function ActionButton({
  accent,
  icon,
  IconComponent,
  title,
  onPress,
  counter,
  iconColor,
}: {
  accent?: boolean;
  icon?: IconProps["icon"];
  IconComponent?: React.ComponentType;
  title: string;
  onPress?: () => void;
  counter?: number | null;
  iconColor?: string;
}) {
  return (
    <TouchableOpacity
      style={{
        flex: 1,
        height: 40,
        borderRadius: 10,
        overflow: "hidden",
        position: "relative",
      }}
      onPress={onPress}
    >
      <View
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "transparent",
          position: "absolute",
        }}
      />
      <View
        style={{
          paddingVertical: 8,
          paddingTop: 10,
          justifyContent: "space-around",
          alignItems: "center",
          height: "100%",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
          }}
        >
          {icon ? (
            <Icon
              icon={icon}
              size={24}
              color={Colors.light.primary}
            />
          ) : (
            IconComponent && <IconComponent />
          )}
          {counter ? (
            <Text
              style={{
                color: iconColor ? iconColor : Colors.light.primary,
              }}
            >
              {counter}
            </Text>
          ) : null}
        </View>
        {/* <Text
          style={{
            color: Colors.light.primary,
            fontSize: 12,
            fontFamily: "Outfit_600SemiBold",
            textAlign: "center",
          }}
        >
          {title}
        </Text> */}
      </View>
    </TouchableOpacity>
  );
}
