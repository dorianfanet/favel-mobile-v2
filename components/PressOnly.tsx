import React, { useEffect, useRef } from "react";
import { View, Text } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureStateChangeEvent,
  GestureTouchEvent,
  TapGestureHandlerEventPayload,
} from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";

const PressOnly = ({
  onPress,
  children,
}: {
  onPress: (
    event: GestureStateChangeEvent<TapGestureHandlerEventPayload>
  ) => void;
  children: React.ReactNode;
}) => {
  return (
    <GestureDetector
      gesture={
        Gesture.Tap()
          .maxDistance(10)
          .onTouchesCancelled((event) => {
            console.log("Tap started");
            runOnJS(onPress)(event);
          })
        // .onTouchesUp((event) => {
        //   console.log("Tap ended, success:");
        // })}
      }
    >
      {/* <View style={{ flex: 1 }}> */}
      {children}
      {/* </View> */}
    </GestureDetector>
  );
};

export default PressOnly;
