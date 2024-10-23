import React from "react";
import { TransportSection } from "@/types/transport";
import Icon from "../Icon";
import Colors from "@/constants/Colors";
import useTheme from "@/hooks/useTheme";
import { padding } from "@/constants/values";
import { Text, View } from "../Themed";
import TransportLeg from "./TransportLeg";

type TransportProps = {
  route: TransportSection[];
};

export type SidebarStyle = {
  width: number;
  marginRight: number;
  alignItems: "center";
};

export const sidebarStyle: SidebarStyle = {
  width: 30,
  marginRight: 10,
  alignItems: "center",
};

export default function Transport({ route }: TransportProps) {
  return (
    <View
      style={{
        padding: padding,
        gap: 5,
      }}
    >
      {route.map((leg, index) => (
        <TransportLeg
          key={index}
          leg={leg}
          isFirst={index === 0}
          isLast={index === route.length - 1}
        />
      ))}
    </View>
  );
}
