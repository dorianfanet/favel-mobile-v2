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
  onValueChange,
  initialValue,
  externalValue,
}: {
  title: string;
  onPress?: () => void;
  destructive?: boolean;
  type?: "default" | "switch";
  onValueChange?: (value: boolean) => void;
  initialValue?: boolean;
  externalValue?: boolean;
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
          onValueChange={onValueChange ? onValueChange : () => {}}
          initialValue={initialValue ? initialValue : false}
          externalValue={externalValue}
        />
      )}
    </TouchableOpacity>
  );
}

function SwitchButton({
  onValueChange,
  initialValue,
  externalValue,
}: {
  onValueChange: (value: boolean) => void;
  initialValue: boolean;
  externalValue?: boolean;
}) {
  const [value, setValue] = useState<boolean>(
    initialValue ? initialValue : true
  );

  return (
    <Switch
      value={externalValue !== undefined ? externalValue : value}
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
