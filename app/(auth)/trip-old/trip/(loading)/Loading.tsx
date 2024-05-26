import { View, SafeAreaView } from "react-native";
import React from "react";
import { useTrip } from "@/context/tripContext";
import Animated, { FadeOut } from "react-native-reanimated";
import { Day } from "@/types/types";
import { padding } from "@/constants/values";
import Content from "./Content";

export default function Loading() {
  const { trip } = useTrip();

  return (
    <>
      <SafeAreaView
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          marginHorizontal: padding,
        }}
      >
        {trip && trip.length && trip[trip.length - 1] && (
          <DayCard day={trip[trip.length - 1]} />
        )}
      </SafeAreaView>
    </>
  );
}

function DayCard({ day }: { day: Day }) {
  return (
    <SafeAreaView>
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <Animated.View
          style={[{}]}
          exiting={FadeOut}
        >
          <Content day={day} />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
