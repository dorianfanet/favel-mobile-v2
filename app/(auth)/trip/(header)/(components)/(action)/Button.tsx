import { View, Text } from "react-native";
import React, { useEffect } from "react";
import { Button } from "@/context/assistantContext";
import { borderRadius } from "@/constants/values";
import { LinearProgress } from "@/components/CircularProgress/CircularProgress";
import ContainedButton from "@/components/ContainedButton";
import Colors from "@/constants/Colors";

export default function ButtonComponent({
  index,
  item,
  onPress,
  selected,
}: {
  index: number;
  item: Button;
  onPress: (item: Button) => void;
  selected?: boolean;
}) {
  useEffect(() => {
    if (item.timeout) {
      const timer = setTimeout(() => {
        onPress(item);
      }, item.timeout.duration);
      return () => clearTimeout(timer);
    }
  }, [item]);

  return (
    <View
      key={index}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: borderRadius,
      }}
    >
      {item.timeout ? (
        <View
          style={{
            position: "absolute",

            left: 0,
            right: 0,
            bottom: 0,
            height: 5,
          }}
        >
          <LinearProgress
            duration={item.timeout.duration}
            color={Colors.light.accent}
            borderRadius={0}
          />
        </View>
      ) : null}
      <ContainedButton
        title={item.text}
        TitleComponent={
          <>
            {item.icon ? (
              <Text
                style={{
                  fontFamily: "Outfit_600Semibold",
                  fontSize: 16,
                  position: "absolute",
                  left: 10,
                }}
              >
                {item.icon}
              </Text>
            ) : null}
            <Text
              style={{
                color: Colors.light.primary,
                // color: "#dfebf9",
                fontFamily: "Outfit_600SemiBold",
                fontSize: 16,
                width: "100%",
                textAlign: "center",
              }}
            >
              {item.text}
            </Text>
          </>
        }
        onPress={() => onPress(item)}
        style={{
          paddingHorizontal: 0,
          paddingVertical: 7,
          borderRadius: 8,
        }}
        backgroundStyle={{
          backgroundColor: selected ? "#44c1e746" : "rgba(8, 62, 79, 0.1)",
          borderWidth: selected ? 3 : 0,
          borderColor: Colors.light.accent,
          borderRadius: 10,
        }}
        type={"ghost"}
      />
    </View>
  );
}
