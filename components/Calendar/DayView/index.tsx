import React from "react";
import { View, ScrollView, Dimensions } from "react-native";
import HourGuide from "./HourGuide";
import EventItem from "./EventItem";
import { Event } from "@/types/calendar";
import { Text } from "@/components/Themed";

interface DayViewProps {
  date: Date;
  // events?: Event[];
}

const DayView: React.FC<DayViewProps> = ({ date }) => {
  const screenHeight = Dimensions.get("window").height;
  const hourHeight = 60; // Height for each hour in the calendar

  console.log(date);

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={{ flexDirection: "row" }}>
        <HourGuide hourHeight={hourHeight} />
        <View style={{ flex: 1 }}>
          {/* Time slots */}
          {Array.from({ length: 24 }).map((_, index) => (
            <View
              key={index}
              style={{
                height: hourHeight,
                borderBottomWidth: 1,
                borderBottomColor: "#333333",
              }}
            />
          ))}
          {/* Events */}
          {/* {events.map((event, index) => (
            <EventItem
              key={index}
              event={event}
              hourHeight={hourHeight}
            />
          ))} */}
          <View
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
      </View>
    </ScrollView>
  );
};

export default DayView;
