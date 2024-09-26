import { View, Text, SafeAreaView, Dimensions } from "react-native";
import React from "react";
import MaskedView from "@react-native-masked-view/masked-view";
import { BackgroundView } from "@/components/Themed";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const { height } = Dimensions.get("window");

export default function Header({
  children,
  gradient,
}: {
  children: React.ReactNode;
  gradient: boolean;
}) {
  const headerHeight = 150;

  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  React.useEffect(() => {
    opacity.value = withTiming(gradient ? 0 : 1, {
      duration: 300,
    });
  }, [gradient]);

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: height,
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      <MaskedView
        style={{
          width: "100%",
          position: "absolute",
          top: 0,
          height: "100%",
          pointerEvents: "box-none",
        }}
        maskElement={
          <View
            style={[
              {
                width: "100%",
                height: headerHeight,
                pointerEvents: "none",
              },
            ]}
          >
            <LinearGradient
              colors={["black", "rgba(0,0,0,0.9)", "transparent"]}
              locations={[0, 0.5, 1]}
              style={{ flex: 1, pointerEvents: "none" }}
            />
            {/* <Animated.View
              style={[
                {
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0,0,0,1)",
                },
                animatedStyle,
              ]}
            /> */}
          </View>
        }
      >
        <BackgroundView
          style={{
            flex: 1,
            alignItems: "center",
            pointerEvents: "box-none",
          }}
        >
          <View
            style={[
              {
                width: "100%",
                justifyContent: "flex-start",
                alignItems: "center",
                pointerEvents: "box-none",
              },
            ]}
          >
            <View
              style={{
                width: "100%",
                height: "100%",
                justifyContent: "center",
              }}
            >
              <SafeAreaView
                style={{
                  flex: 1,
                }}
              >
                {children}
              </SafeAreaView>
            </View>
          </View>
        </BackgroundView>
      </MaskedView>
    </View>
  );
}
