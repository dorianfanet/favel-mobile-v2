import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { Assistant } from "@/context/assistantContext";
import { MotiView } from "moti";
import Colors from "@/constants/Colors";

export default function Loading({ assistant }: { assistant: Assistant }) {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (assistant.state !== "loading") return;

    const timer = setTimeout(() => {
      setShouldAnimate(true);
    }, 210); // Match this delay with the parent's animation duration

    return () => clearTimeout(timer);
  }, [assistant.state]);

  return shouldAnimate ? (
    <MotiView
      from={{
        opacity: 0.3,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0.3,
      }}
      transition={{
        type: "timing",
        duration: 500,
        repeat: Infinity,
        delay: 0,
      }}
      // key={`${assistant.key}-loading`}
      key="fdshjjjy"
      style={{
        padding: 8,
        paddingTop: 7.5,
        paddingBottom: 7.5,
        flex: 1,
      }}
    >
      <Text
        style={{
          // color: "#dfebf9",
          color: Colors.light.text.primary,
          fontFamily: "Outfit_500Medium",
          fontSize: 16,
          width: "100%",
        }}
        // numberOfLines={3}
      >
        {assistant.state === "loading" ? assistant.message : "Loading..."}
      </Text>
    </MotiView>
  ) : (
    <View
      style={{
        padding: 10,
        paddingTop: 7.5,
        paddingBottom: 7.5,
        flex: 1,
        opacity: 0.3,
      }}
    >
      <Text
        style={{
          // color: "#dfebf9",
          color: Colors.light.text.primary,
          fontFamily: "Outfit_500Medium",
          fontSize: 16,
          width: "100%",
        }}
        // numberOfLines={3}
      >
        {assistant.state === "loading" ? assistant.message : "Loading..."}
      </Text>
    </View>
  );
}
