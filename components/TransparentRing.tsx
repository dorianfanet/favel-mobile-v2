import React from "react";
import { View } from "react-native";
import Svg, { Defs, Rect, Mask, Circle } from "react-native-svg";

const TransparentRing = ({ size = 100, strokeWidth = 10, color = "blue" }) => {
  const innerRadius = size / 2 - strokeWidth;

  return (
    <View style={{ width: size, height: size }}>
      <Svg
        width={size}
        height={size}
      >
        <Defs>
          <Mask
            id="mask"
            x="0"
            y="0"
            width={size}
            height={size}
          >
            <Rect
              width={size}
              height={size}
              fill="white"
            />
            <Circle
              r={innerRadius}
              cx={size / 2}
              cy={size / 2}
              fill="black"
            />
          </Mask>
        </Defs>
        <Rect
          width={size}
          height={size}
          fill={color}
          mask="url(#mask)"
        />
      </Svg>
    </View>
  );
};

export default TransparentRing;
