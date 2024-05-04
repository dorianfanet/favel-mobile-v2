import React from "react";
import { Text } from "../Themed";
import Colors from "@/constants/Colors";

export default function MenuTitle({ title }: { title: string }) {
  return (
    <Text
      style={{
        fontSize: 18,
        fontFamily: "Outfit_500Medium",
        color: Colors.light.primary,
        marginVertical: 10,
      }}
    >
      {title}
    </Text>
  );
}
