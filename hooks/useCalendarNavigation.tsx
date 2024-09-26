import { useState, useCallback } from "react";
import { Dimensions } from "react-native";
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Gesture } from "react-native-gesture-handler";

const { width } = Dimensions.get("window");
const SWIPE_THRESHOLD = width / 3;

export const useCalendarNavigation = (onDateChange: (date: Date) => void) => {
  const [currentIndex, setCurrentIndex] = useState(1);
  const translateX = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        if (event.translationX > 0) {
          runOnJS(goToPrevDay)();
        } else {
          runOnJS(goToNextDay)();
        }
      } else {
        translateX.value = withTiming(0);
      }
    });

  const goToNextDay = useCallback(() => {
    translateX.value = withTiming(-width, {}, () => {
      runOnJS(setCurrentIndex)(2);
      // runOnJS(onDateChange)(new Date(Date.now() + 86400000)); // Add one day
      translateX.value = 0;
    });
  }, [onDateChange]);

  const goToPrevDay = useCallback(() => {
    translateX.value = withTiming(width, {}, () => {
      runOnJS(setCurrentIndex)(0);
      // runOnJS(onDateChange)(new Date(Date.now() - 86400000)); // Subtract one day
      translateX.value = 0;
    });
  }, [onDateChange]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return {
    gesture,
    animatedStyle,
    currentIndex,
    goToNextDay,
    goToPrevDay,
  };
};
