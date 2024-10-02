import { Event } from "@/types/calendar";
import { TripEvent } from "@/types/trip";
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface EventItemProps {
  event: TripEvent;
  hourHeight: number;
  dayDate: Date;
}

const EventItem: React.FC<EventItemProps> = ({
  event,
  hourHeight,
  dayDate,
}) => {
  // check if the event starts on the same day as the dayDate
  const startHour =
    event.start.getDate() !== dayDate.getDate()
      ? 0
      : event.start.getHours() + event.start.getMinutes() / 60;
  const endHour =
    event.end.getDate() !== dayDate.getDate()
      ? 24
      : event.end.getHours() + event.end.getMinutes() / 60;
  const duration = endHour - startHour;

  // console.log(event.id, duration);

  return (
    <TouchableOpacity
      style={{
        position: "absolute",
        top: startHour * hourHeight,
        left: 2,
        right: 2,
        height: duration * hourHeight,
        backgroundColor: "#FF9500",
        borderRadius: 5,
        padding: 5,
        overflow: "hidden",
      }}
    >
      <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>{event.name}</Text>
      <Text style={{ color: "#FFFFFF" }}>{event.location}</Text>
    </TouchableOpacity>
  );
};

export default EventItem;
