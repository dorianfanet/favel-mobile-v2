import { View, Text, SafeAreaView } from "react-native";
import React from "react";
import MaskedView from "@react-native-masked-view/masked-view";
import { BackgroundView } from "@/components/Themed";
import { LinearGradient } from "expo-linear-gradient";

export default function Header({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 200,
        justifyContent: "center",
        alignItems: "center",
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
                height: 200,
                pointerEvents: "none",
              },
            ]}
          >
            <LinearGradient
              colors={["black", "rgba(0,0,0,.95)", "transparent"]}
              locations={[0, 0.6, 1]}
              style={{ flex: 1, pointerEvents: "none" }}
            />
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
