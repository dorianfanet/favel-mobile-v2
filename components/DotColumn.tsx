import React, { useCallback, useState } from "react";
import { View } from "./Themed";
import useTheme from "@/hooks/useTheme";
import Colors from "@/constants/Colors";
import { LayoutChangeEvent } from "react-native";

const DotColumn = ({ dotRadius = 2.5, gap = 5 }) => {
  const [dots, setDots] = useState(0);

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { height } = event.nativeEvent.layout;
      const dotDiameter = dotRadius * 2;
      const dotWithGap = dotDiameter + gap;
      const numberOfDots = Math.floor(height / dotWithGap);
      setDots(numberOfDots);
    },
    [dotRadius, gap]
  );

  const { theme } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap,
      }}
      onLayout={onLayout}
    >
      {Array.from({ length: dots }).map((_, index) => (
        <View
          key={index}
          style={{
            width: dotRadius * 2,
            height: dotRadius * 2,
            borderRadius: dotRadius,
            backgroundColor: Colors[theme].accent,
            opacity: 0.5,
          }}
        />
      ))}
    </View>
  );
};

export default React.memo(DotColumn);
