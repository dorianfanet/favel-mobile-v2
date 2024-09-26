import { Event } from "@/types/calendar";
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface EventItemProps {
  event: Event;
  hourHeight: number;
}

const EventItem: React.FC<EventItemProps> = ({ event, hourHeight }) => {
  const startHour = event.start.getHours() + event.start.getMinutes() / 60;
  const endHour = event.end.getHours() + event.end.getMinutes() / 60;
  const duration = endHour - startHour;

  return (
    <TouchableOpacity
      style={{
        position: "absolute",
        top: startHour * hourHeight,
        left: 2,
        right: 2,
        height: duration * hourHeight,
        backgroundColor: event.color || "#FF9500",
        borderRadius: 5,
        padding: 5,
        overflow: "hidden",
      }}
    >
      <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>
        {event.title}
      </Text>
      <Text style={{ color: "#FFFFFF" }}>{event.location}</Text>
    </TouchableOpacity>
  );
};

export default EventItem;
