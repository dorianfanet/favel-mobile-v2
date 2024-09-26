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
  const translateX = useSharedValue(0);

  // const updateDatesAndPosition = useCallback(
  //   (newCurrentDate: Date, newTranslateX: number) => {
  //     setDates(getDatesArray(newCurrentDate));
  //     translateX.value = newTranslateX;
  //   },
  //   []
  // );

  // useEffect(() => {
  //   if (
  //     currentDate &&
  //     currentDate instanceof Date &&
  //     !isNaN(currentDate.getTime())
  //   ) {
  //     // updateDatesAndPosition(currentDate, 0);
  //   } else {
  //     const today = new Date();
  //     updateDatesAndPosition(today, 0);
  //     onDateChange(today);
  //   }
  // }, [currentDate, updateDatesAndPosition, onDateChange]);

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
      console.log("translateX", translateX.value);
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() - index);
      onDateChange(newDate);
      translateX.value = 0;
    },
    [currentDate, onDateChange]
  );

  const animatedStylePrevious = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
  const animatedStyleCurrent = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
  const animatedStyleNext = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <View style={[styles.container]}>
        <Animated.View
          key={incrementDate(currentDate, -1).toISOString()}
          style={[styles.dayContainer, { left: -width }, animatedStylePrevious]}
        >
          {children(incrementDate(currentDate, -1))}
        </Animated.View>
        <Animated.View
          key={currentDate.toISOString()}
          style={[styles.dayContainer, { left: 0 }, animatedStyleCurrent]}
        >
          {children(currentDate)}
        </Animated.View>
        <Animated.View
          key={incrementDate(currentDate, 1).toISOString()}
          style={[styles.dayContainer, { left: width }, animatedStyleNext]}
        >
          {children(incrementDate(currentDate, 1))}
        </Animated.View>
      </View>
    </GestureDetector>
  );
};

const incrementDate = (date: Date, increment: number) => {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + increment);
  return newDate;
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

// CONSLUSION DU 26/09/2024 À 4H DU MATIN
// J'ai réussi à implémenter la navigation entre les jours dans le composant CalendarNavigation.
// Ça marche bien MAIS il y a un léger flickering lorsqu'on swipe entre les jours.
// J'ai essayé plein de choses mais ça ne marche pas.
// Le problème vient du fait que je n'arrive pas à synchroniser les dates et les translations.

// Idées pour la suite:
// - Utiliser un useLayoutEffect pour synchroniser les dates et les translations (ok copilot pas sur de celle là)

// Le vrai truc que je veux essayer c'est en s'inspirant du calendrier de l'application native de l'iPhone.
// En se focusant sur l'animation qui "push" les jours au clique sur la journée dans le header.
// Et avec un animate presence je peux faire une animation de slide pour les jours qui disparaissent et apparaissent.
// Et en fait le pan va juste trigger l'animation de slide pour les jours qui disparaissent et apparaissent depuis le header.
