import { View, Text } from "react-native";
import React, { useEffect } from "react";
import Colors from "@/constants/Colors";
import { MMKV } from "../_layout";

export default function onboarding() {
  useEffect(() => {
    MMKV.setStringAsync("onboardingSeen", "true");
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.light.accent,
      }}
    >
      <Text>onboarding</Text>
    </View>
  );
}
