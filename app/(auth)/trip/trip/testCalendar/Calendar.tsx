import { padding } from "@/constants/values";
import React, { useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import {
  Gesture,
  GestureDetector,
  PanGestureHandler,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import WeekCalendar from "./WeekCalendar";

const { width } = Dimensions.get("window");

const DayView = ({ date }) => {
  // Your day view component
  return (
    <View style={styles.dayView}>
      <Text>{date}</Text>
      {/* Render events and other content */}
    </View>
  );
};

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const Calendar = () => {
  const translateX = useSharedValue(0);
  const prevTranslateX = useSharedValue(0);

  // const onGestureEvent = useAnimatedGestureHandler({
  //   onStart: (_, context) => {
  //     context.startX = translateX.value;
  //   },
  //   onActive: (event, context) => {
  //     translateX.value = context.startX + event.translationX;
  //   },
  //   onEnd: (event) => {
  //     if (event.velocityX > 0) {
  //       // Swipe right
  //       translateX.value = withSpring(translateX.value + 375); // Assuming 375 is the width of the day view
  //     } else if (event.velocityX < 0) {
  //       // Swipe left
  //       translateX.value = withSpring(translateX.value - 375);
  //     }
  //   },
  // });

  const gesture = Gesture.Pan()
    .onStart(() => {
      prevTranslateX.value = translateX.value;
    })
    .onUpdate((event) => {
      console.log("prevTranslateX", prevTranslateX.value);
      console.log("event", event.translationX);
      console.log(-width * 2);
      // if (prevTranslateX.value + event.translationX > -width * 3) return;
      if (
        prevTranslateX.value + event.translationX > 0 ||
        prevTranslateX.value + event.translationX < -width * 2
      )
        return;
      translateX.value = prevTranslateX.value + event.translationX;
    })
    .onEnd((event) => {
      if (
        prevTranslateX.value + event.translationX > 0 ||
        prevTranslateX.value + event.translationX < -width * 2
      )
        return;
      // translateX.value = prevTranslateX.value + event.translationX;
      if (event.velocityX > 0) {
        // Swipe right
        const closest = Math.round(
          ((prevTranslateX.value + width) / width) * width
        );
        translateX.value = withSpring(closest, {
          velocity: event.velocityX,
          damping: 20,
        }); // Assuming 375 is the width of the day view
      } else if (event.velocityX < 0) {
        // Swipe left
        const closest = Math.round(
          ((prevTranslateX.value - width) / width) * width
        );
        // translateX.value = withSpring(closest);
        translateX.value = withSpring(closest, {
          velocity: event.velocityX,
          damping: 20,
        });
      } else {
        // const closest = Math.round(translateX.value / width) * width;
        // translateX.value = withSpring(closest);
      }
    })
    .runOnJS(true);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Abbaye cistercienne",
      start: 540,
      end: 660,
      day: "Mon",
      aid: "123cdc46-e1dd-4095-86fb-f8ea5c32d31f",
      openingTime: {
        start: 540,
        end: 1200,
      },
    },
    {
      id: 2,
      title: "Lunch",
      start: 600,
      end: 750,
      day: "Tue",
      aid: "676904cc-87ac-4ab9-9506-dd5052b25b4f",
      openingTime: {
        start: 500,
        end: 840,
      },
    },
  ]);

  return (
    <View
      style={{
        flex: 1,
        height: "100%",
        padding: 0,
        paddingRight: 0,
        paddingTop: 40,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          flexDirection: "row",
        }}
      >
        {days.map((day, index) => (
          <View
            key={index}
            style={{
              flex: 1,
              padding: 10,
              borderRightWidth: 1,
              borderColor: "#ccc",
            }}
          >
            <Text>{day}</Text>
          </View>
        ))}
      </View>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.container, animatedStyle]}>
          <WeekCalendar />
          <WeekCalendar />
          <WeekCalendar />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width * 3,
    flexDirection: "row",
  },
  dayView: {
    width: 375, // Assuming the width of the day view
    height: "100%",
    backgroundColor: "white",
    borderRightWidth: 1,
    borderColor: "#ccc",
  },
});

export default Calendar;
