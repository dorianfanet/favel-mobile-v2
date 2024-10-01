import React, { useState, useCallback, useEffect, useRef } from "react";
import { Dimensions, useColorScheme, View } from "react-native";
import CalendarHeader from "./CalendarHeader";
import DayView from "./DayView";
import CalendarNavigation from "./CalendarNavigation";
import Carousel from "react-native-reanimated-carousel";
import { Text } from "../Themed";
import { TripDay, TripEvent } from "@/types/trip";
import Colors from "@/constants/Colors";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { padding } from "@/constants/values";

const { width } = Dimensions.get("window");

const headerHeight = 100;

function Calendar({
  startDate,
  endDate,
  days,
  events,
  height,
}: {
  startDate: Date;
  endDate: Date;
  days: TripDay[];
  events: TripEvent[];
  height: number;
}) {
  const [currentDate, setCurrentDate] = useState<Date>(() => startDate);

  const progressValue = useSharedValue(0);

  console.log("progressValue", -progressValue.value / 3 / width);

  console.log((width * (width - padding * 2)) / width);
  console.log(width);

  const calendarRef = React.useRef<React.ElementRef<typeof Carousel>>(null);

  const handleDateChange = useCallback((date: Date) => {
    // setCurrentDate(date);
    const index = days.findIndex(
      (day) => day.date.getTime() === date.getTime()
    );
    const currentIndex = calendarRef.current?.getCurrentIndex();
    calendarRef.current?.scrollTo({
      count: index - (currentIndex || 0),
      animated: true,
    });
  }, []);

  const theme = useColorScheme();

  const animnatedStyle = useAnimatedStyle(() => {
    return {
      // left: padding + (width - (padding * 2) / 4) * progressValue.value,
      left:
        (-progressValue.value * ((width - padding * 2) / width)) /
          (days.length - 1) -
        40 * (-progressValue.value / (days.length - 1) / width),
    };
  });

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <View
        style={{
          width: "100%",
          height: headerHeight,
          justifyContent: "center",
        }}
      >
        <Animated.View
          style={[
            {
              position: "absolute",
              width: 40,
              height: 40,
              left: 0,
              top: 40,
              backgroundColor: Colors[theme || "light"].accent,
              borderRadius: 20,

              transform: [{ translateX: padding }],
            },
            animnatedStyle,
          ]}
        />
        <CalendarHeader
          currentDate={currentDate}
          days={days}
          onDateChange={handleDateChange}
        />
        <View
          style={{
            position: "absolute",
            width: "100%",
            height: 1,
            backgroundColor: Colors[theme || "light"].text.primary,
            bottom: 0,
            opacity: 0.3,
          }}
        ></View>
      </View>
      <Carousel
        ref={calendarRef}
        loop={false}
        width={width}
        height={height - headerHeight}
        data={days}
        scrollAnimationDuration={500}
        onProgressChange={(progress) => {
          progressValue.value = progress;
        }}
        onSnapToItem={(index) => {
          setCurrentDate(days[index].date);
        }}
        renderItem={({ item, index }) => (
          <DayView
            dayDate={item.date}
            events={events.filter((event) => {
              const dayStart = new Date(
                item.date.setHours(0, 0, 0, 0)
              ).getTime();
              const dayEnd = new Date(
                item.date.setHours(23, 59, 59, 999)
              ).getTime();

              const eventStart = new Date(event.start).getTime();
              const eventEnd = new Date(event.end).getTime();

              return eventStart <= dayEnd && eventEnd >= dayStart;
            })}
          />
        )}
      />
    </View>
  );
}

export default Calendar;
