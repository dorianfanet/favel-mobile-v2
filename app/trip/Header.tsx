import { View, Text, SafeAreaView, Dimensions } from "react-native";
import React from "react";
import MaskedView from "@react-native-masked-view/masked-view";
import { BackgroundView } from "@/components/Themed";
import { LinearGradient } from "expo-linear-gradient";
import { easeGradient } from "react-native-easing-gradient";

const { height } = Dimensions.get("window");

const { colors, locations } = easeGradient({
  colorStops: {
    1: {
      color: "transparent",
    },
    0.2: {
      color: "#000000e7",
    },
    0: {
      color: "#000000e7",
    },
  },
});

export default function Header({ children }: { children: React.ReactNode }) {
  const headerHeight = 150;

  return (
    <>
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
            pointerEvents: "none",
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
                colors={colors}
                locations={locations}
                style={{ flex: 1, pointerEvents: "none" }}
              />
              {/* <LinearGradient
                colors={["black", "rgba(0,0,0,0.8)", "transparent"]}
                locations={[0, 0.5, 1]}
                style={{ flex: 1, pointerEvents: "none" }}
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
            ></View>
          </BackgroundView>
        </MaskedView>
      </View>
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
        }}
      >
        <SafeAreaView
          style={{
            flex: 1,
            pointerEvents: "auto",
          }}
        >
          {children}
        </SafeAreaView>
      </View>
    </>
  );
}
