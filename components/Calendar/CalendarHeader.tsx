// Calendar/CalendarHeader.tsx
import React, { useMemo } from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { format } from "date-fns";
import { Text, View } from "../Themed";

interface CalendarHeaderProps {
  currentDate: Date;
  startDate: Date;
  endDate: Date;
  onDateChange: (date: Date) => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  startDate,
  endDate,
  onDateChange,
}) => {
  const generateDateList = (start: Date, end: Date) => {
    const dateList = [];
    let currentDate = new Date(start);
    const endDate = new Date(end);

    while (currentDate <= endDate) {
      dateList.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
    }

    return dateList;
  };

  const dateList = useMemo(() => {
    return generateDateList(startDate, endDate);
  }, [startDate, endDate]);

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 16,
        alignItems: "center",
      }}
    >
      {dateList.map((date, index) => (
        <DayButton
          key={date.toISOString()}
          onPress={(date: Date) => {
            onDateChange(date);
          }}
          date={date}
          currentDate={currentDate.getTime() === date.getTime()}
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
  return (
    <TouchableOpacity
      onPress={() => onPress(date)}
      style={{
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: currentDate ? "#00929f" : "transparent",
        borderRadius: 5,
        padding: 8,
      }}
    >
      <Text>{format(date, "E")}</Text>
      <Text>{format(date, "d")}</Text>
    </TouchableOpacity>
  );
}
