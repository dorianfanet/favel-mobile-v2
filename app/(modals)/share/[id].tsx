import { Touchable, View } from "react-native";
import { View as ThemedView, Text } from "@/components/Themed";
import React from "react";
import { padding } from "@/constants/values";
import { useLocalSearchParams } from "expo-router";
import Colors from "@/constants/Colors";
import { TouchableOpacity } from "react-native-gesture-handler";
import Icon from "@/components/Icon";

export default function Share() {
  const { id } = useLocalSearchParams();

  return (
    <ThemedView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: padding,
        paddingTop: 80,
      }}
    >
      <View
        style={{
          height: 60,
          borderRadius: 20,
          padding: 10,
          paddingLeft: 15,
          paddingRight: 60,
          backgroundColor: "#fff",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <Text
          style={{
            fontFamily: "Outfit_400Regular",
          }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          https://app.favel.net/invite/{id}
        </Text>
        <View
          style={{
            position: "absolute",
            right: 10,
            height: 40,
            width: 40,
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: Colors.light.background,
              width: "100%",
              height: "100%",
              borderRadius: 10,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Icon
              icon="copyIcon"
              size={20}
              color={Colors.light.primary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}
