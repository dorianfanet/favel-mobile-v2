import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle as SvgCircle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  useAnimatedStyle,
} from "react-native-reanimated";

const AnimatedCircle = Animated.createAnimatedComponent(SvgCircle);

export default function CircularProgress({
  radius,
  strokeWidth,
  duration,
  color,
}: {
  radius: number;
  strokeWidth: number;
  duration: number;
  color: string;
}) {
  const circumference = 2 * Math.PI * radius;
  const animatedValue = useSharedValue(0);

  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset:
        circumference - (circumference * animatedValue.value) / 100,
    };
  });

  useEffect(() => {
    animatedValue.value = withTiming(100, {
      duration: duration,
      easing: Easing.linear,
    });
  }, [duration]);

  return (
    // <View
    //   style={{
    //     ...styles.container,
    //     // width: radius * 2,
    //     // height: radius * 2,
    //   }}
    // >
    <Svg
      width={radius * 2 - strokeWidth}
      height={radius * 2 - strokeWidth}
      viewBox={`0 0 ${radius * 2 + strokeWidth} ${radius * 2 + strokeWidth}`}
    >
      <SvgCircle
        cx={(radius * 2 + strokeWidth) / 2}
        cy={(radius * 2 + strokeWidth) / 2}
        r={radius}
        stroke="transparent"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <AnimatedCircle
        cx={(radius * 2 + strokeWidth) / 2}
        cy={(radius * 2 + strokeWidth) / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        animatedProps={animatedProps}
      />
    </Svg>
    // </View>
  );
}

export function LinearProgress({
  duration,
  color,
  borderRadius,
}: {
  duration: number;
  color?: string;
  borderRadius?: number;
}) {
  const scaleX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scaleX: withTiming(scaleX.value, { duration }) }],
    };
  });

  useEffect(() => {
    scaleX.value = 1;
  }, [duration]);

  return (
    <Animated.View
      style={[
        {
          ...styles.container,
          width: "100%",
          height: "100%",
          backgroundColor: color ? color : "#f0f0f0",
          overflow: "hidden",
          borderRadius: borderRadius ? borderRadius : 0,
          transformOrigin: "left",
        },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});
