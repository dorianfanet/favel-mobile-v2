import React from "react";
import { Text, View } from "../Themed";
import { padding } from "@/constants/values";
import Icon from "../Icon";
import useTheme from "@/hooks/useTheme";
import Colors from "@/constants/Colors";

interface SectionProps {
  title: string;
  link?: string;
  children: React.ReactNode;
}

export default function Section({ title, link, children }: SectionProps) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        paddingHorizontal: padding,
        paddingVertical: 10,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 10,
        }}
      >
        <Text
          fontStyle="title"
          style={{
            fontFamily: "Outfit_700Bold",
          }}
        >
          {title}
        </Text>
        {link ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              opacity: 0.8,
            }}
          >
            <Text fontStyle="subtitle">{link}</Text>
            <Icon
              icon="chevronLeftIcon"
              size={14}
              strokeWidth={2}
              color={Colors[theme].text.primary}
              style={{
                transform: [{ rotate: "180deg" }],
              }}
            />
          </View>
        ) : null}
      </View>
      {children}
    </View>
  );
}
