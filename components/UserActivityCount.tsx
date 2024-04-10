import { View, Text } from "react-native";
import React from "react";
import { UserActivityState } from "@/types/types";
import Icon from "./Icon";
import Colors from "@/constants/Colors";

export default function UserActivityCount({
  userActivity,
}: {
  userActivity: UserActivityState | null;
}) {
  return userActivity && userActivity.count > 0 ? (
    <View
      style={{
        padding: 2,
        borderRadius: 5,
        backgroundColor: "white",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}
    >
      <Icon
        icon="profileIcon"
        size={10}
        color={Colors.light.primary}
      />
      <Text
        style={{
          fontSize: 10,
          fontFamily: "Outfit_500Medium",
        }}
      >
        {userActivity.count > 9 ? "9+" : userActivity.count}
      </Text>
    </View>
  ) : null;
}
