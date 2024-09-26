import React, { useState, useCallback } from "react";
import { View } from "react-native";
import CalendarHeader from "./CalendarHeader";
import DayView from "./DayView";
import { Event } from "@/types/calendar";
import CalendarNavigation from "./CalendarNavigation";

function Calendar({ startDate, endDate }: { startDate: Date; endDate: Date }) {
  const [currentDate, setCurrentDate] = useState(() => startDate);

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <CalendarHeader
        currentDate={currentDate}
        startDate={startDate}
        endDate={endDate}
        onDateChange={setCurrentDate}
      />
      {/* <DayView
      // date={currentDate}
      // events={[]}
      /> */}
      <CalendarNavigation
        currentDate={currentDate}
        onDateChange={setCurrentDate}
      >
        {(date: Date) => (
          <DayView
            date={date}
            // events={generateEventsForDate(date)}
          />
        )}
      </CalendarNavigation>
    </View>
  );
}

export default Calendar;
