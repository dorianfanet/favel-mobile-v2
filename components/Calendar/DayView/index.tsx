import React from "react";
import { View, ScrollView, Dimensions, useColorScheme } from "react-native";
import HourGuide from "./HourGuide";
import EventItem from "./EventItem";
import { Text } from "@/components/Themed";
import { TripEvent } from "@/types/trip";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useFocusEffect } from "@react-navigation/native";
import Colors from "@/constants/Colors";
import { padding } from "@/constants/values";

interface DayViewProps {
  events: TripEvent[];
  dayDate: Date;
}

const DayView: React.FC<DayViewProps> = ({ events, dayDate }) => {
  const hourHeight = 100; // Height for each hour in the calendar

  const theme = useColorScheme();

  // console.log("events", JSON.stringify(events, null, 2));

  return (
    <ScrollView style={{ flex: 1, paddingVertical: 10 }}>
      {/* <View style={{ flexDirection: "row" }}>
        <HourGuide hourHeight={hourHeight} />
        <View style={{ flex: 1 }}>
          {Array.from({ length: 24 }).map((_, index) => (
            <View
              key={index}
              style={{
                height: hourHeight,
                borderBottomWidth: 1,
                borderBottomColor: "#333333",
              }}
            />
          ))} */}
      {/* Events */}
      <View
        style={{
          flex: 1,
          paddingHorizontal: padding,
          paddingLeft: 0,
        }}
      >
        {Array.from({ length: 25 }).map((_, index) => (
          <View
            key={index}
            style={{
              height: hourHeight,
              justifyContent: "flex-start",
              alignItems: "flex-start",
              flexDirection: "row",
            }}
          >
            <Text
              fontStyle="caption"
              style={{
                transform: [{ translateY: -10 }],
                textAlign: "right",
                width: 40,
              }}
            >
              {index === 0
                ? "12 AM"
                : index === 12
                ? "12 PM"
                : index > 12
                ? `${index - 12} ${index < 24 ? "PM" : "AM"}`
                : `${index} AM`}
            </Text>
            <View
              style={{
                height: 1,
                flex: 1,
                marginLeft: 10,
                backgroundColor: Colors[theme || "light"].text.primary,
                opacity: 0.3,
              }}
            />
          </View>
        ))}
      </View>
      <View
        style={{
          flex: 1,
          position: "absolute",
          top: 0,
          left: 50,
          right: 0,
          bottom: 0,
        }}
      >
        {events.map((event, index) => (
          <EventItem
            key={`${event.id}-${index}`}
            event={event}
            hourHeight={hourHeight}
            dayDate={dayDate}
          />
        ))}
      </View>
      {/* <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: 100,
            }}
          >
            <Text>{date.toDateString()}</Text>
          </View>
        </View>
      </View> */}
    </ScrollView>
  );
};

export default DayView;
