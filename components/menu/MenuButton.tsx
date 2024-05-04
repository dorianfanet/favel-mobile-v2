import { Switch, TouchableOpacity } from "react-native";
import { Text } from "../Themed";
import Colors from "@/constants/Colors";
import { padding } from "@/constants/values";
import { useState } from "react";

export default function MenuButton({
  title,
  onPress,
  destructive = false,
  type = "default",
}: {
  title: string;
  onPress?: () => void;
  destructive?: boolean;
  type?: "default" | "switch";
}) {
  return (
    <TouchableOpacity
      style={{
        height: 45,
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
        paddingHorizontal: padding,
        backgroundColor: "white",
      }}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.2 : 1}
    >
      <Text
        style={{
          color: destructive ? "#ff0000" : Colors.light.primary,
          fontFamily: "Outfit_400Regular",
          fontSize: 16,
          flex: 1,
        }}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {title}
      </Text>
      {type === "switch" && (
        <SwitchButton
          onValueChange={(value) => {
            console.log(value);
          }}
        />
      )}
    </TouchableOpacity>
  );
}

function SwitchButton({
  onValueChange,
}: {
  onValueChange: (value: boolean) => void;
}) {
  const [value, setValue] = useState(true);

  return (
    <Switch
      value={value}
      onValueChange={(value) => {
        setValue(value);
        onValueChange(value);
      }}
      trackColor={{
        true: Colors.light.accent,
      }}
    />
  );
}
