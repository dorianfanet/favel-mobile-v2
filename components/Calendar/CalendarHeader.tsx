// Calendar/CalendarHeader.tsx
import React, { useMemo } from "react";
import { TouchableOpacity, StyleSheet, useColorScheme } from "react-native";
import { format } from "date-fns";
import { Text, View } from "../Themed";
import { TripDay } from "@/types/trip";
import Colors from "@/constants/Colors";
import { padding } from "@/constants/values";

interface CalendarHeaderProps {
  currentDate: Date;
  days: TripDay[];
  onDateChange: (date: Date) => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  days,
  onDateChange,
}) => {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        margin: padding,
        alignItems: "center",
      }}
    >
      {days.map((day, index) => (
        <DayButton
          key={day.date.toISOString()}
          onPress={(date: Date) => {
            onDateChange(date);
          }}
          date={day.date}
          currentDate={currentDate.getTime() === day.date.getTime()}
        />
      ))}
    </View>
  );
};

export default CalendarHeader;

function DayButton({
  onPress,
  date,
  currentDate,
}: {
  onPress: (date: Date) => void;
  date: Date;
  currentDate: boolean;
}) {
  const theme = useColorScheme();

  return (
    <TouchableOpacity
      onPress={() => onPress(date)}
      style={{
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
      }}
    >
      <Text fontStyle="caption">{format(date, "E")}</Text>
      <View
        style={{
          backgroundColor: Colors[theme || "light"].accent,
          borderRadius: 20,
          width: 30,
          height: 30,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text fontStyle="subtitle">{format(date, "d")}</Text>
      </View>
    </TouchableOpacity>
  );
}
