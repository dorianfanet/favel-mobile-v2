import {
  View,
  Text,
  SafeAreaView,
  Pressable,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { padding } from "@/constants/values";
import { BlurView } from "@/components/Themed";
import Icon from "@/components/Icon";
import Colors from "@/constants/Colors";
import { MotiView } from "moti";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

export default function Chat() {
  const [state, setState] = React.useState(false);
  const [width, setWidth] = React.useState(0);

  const style = useAnimatedStyle(() => ({
    opacity: withTiming(state ? 1 : 0),
    transform: [
      {
        scale: withTiming(state ? 1 : 0),
      },
    ],
  }));

  return (
    <SafeAreaView
      style={{
        flex: 1,
        position: "absolute",
        top: 0,
        left: padding,
        right: padding,
        bottom: 0,
        shadowColor: Colors.light.primary,
        shadowOffset: {
          width: 0,
          height: 0,
        },
        shadowOpacity: 0.6,
        shadowRadius: 10,
        elevation: 10,
      }}
      pointerEvents="box-none"
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setWidth(width);
      }}
    >
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 50,
            width: "100%",
            height: "100%",
            transformOrigin: `${width - 80}px 20px`,
          },
          style,
        ]}
      >
        <BlurView></BlurView>
      </Animated.View>
      <TouchableOpacity
        onPress={() => setState((prev) => !prev)}
        style={{
          position: "absolute",
          top: 50,
          right: 82,
          width: 40,
          height: 40,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Icon
          icon="messageDotsIcon"
          size={20}
          color={Colors.dark.primary}
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
