import { useCalendarNavigation } from "@/hooks/useCalendarNavigation";
import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, Dimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { View } from "../Themed";

interface CalendarNavigationProps {
  children: (date: Date) => React.ReactNode;
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

// const width = 100;
const { width } = Dimensions.get("window");

const CalendarNavigation: React.FC<CalendarNavigationProps> = ({
  children,
  currentDate,
  onDateChange,
}) => {
  const [dates, setDates] = useState(() => getDatesArray(currentDate));
  const translateX = useSharedValue(0);

  const updateDatesAndPosition = useCallback(
    (newCurrentDate: Date, newTranslateX: number) => {
      setDates(getDatesArray(newCurrentDate));
      translateX.value = newTranslateX;
    },
    []
  );

  useEffect(() => {
    if (
      currentDate &&
      currentDate instanceof Date &&
      !isNaN(currentDate.getTime())
    ) {
      updateDatesAndPosition(currentDate, 0);
    } else {
      const today = new Date();
      updateDatesAndPosition(today, 0);
      onDateChange(today);
    }
  }, [currentDate, updateDatesAndPosition, onDateChange]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      const velocity = event.velocityX;
      const projection = translateX.value + velocity * 0.2;
      const snapPoint = Math.round(projection / width) * width;

      translateX.value = withTiming(snapPoint, {}, () => {
        runOnJS(onSwipeComplete)(snapPoint / width);
      });
    })
    .runOnJS(true);

  const onSwipeComplete = useCallback(
    (index: number) => {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() - index);
      onDateChange(newDate);
      updateDatesAndPosition(newDate, 0);
    },
    [currentDate, onDateChange, updateDatesAndPosition]
  );

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {dates.map((date, index) => (
          <View
            key={date.toISOString()}
            style={[styles.dayContainer, { left: width * (index - 1) }]}
          >
            {children(date)}
          </View>
        ))}
      </Animated.View>
    </GestureDetector>
  );
};

const getDatesArray = (currentDate: Date) => [
  new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate() - 1
  ),
  new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate()
  ),
  new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate() + 1
  ),
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  dayContainer: {
    width,
    position: "absolute",
    top: 0,
    bottom: 0,
  },
});

export default CalendarNavigation;
