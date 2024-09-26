import React from "react";
import { CameraProvider } from "@/context/cameraContext";
import { Slot, Stack } from "expo-router";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { AssistantProvider } from "@/context/assistantContext";
import Calendar from "@/components/Calendar";
import { Text, View } from "@/components/Themed";
import { Dimensions, SafeAreaView } from "react-native";

const dates = {
  startDate: new Date(2024, 8, 25),
  endDate: new Date(2024, 8, 29),
};

export default function Layout() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View
        background="primary"
        style={{
          flex: 1,
        }}
      >
        <SafeAreaView
          style={{
            flex: 1,
          }}
        >
          {/* <InfiniteCarousel
          data={data}
          renderItem={renderItem}
          style={{ flex: 1 }} // Optional: Add custom styles
        /> */}
          <Calendar
            startDate={dates.startDate}
            endDate={dates.endDate}
          />
          {/* <Carousel
            data={data}
            renderItem={renderItem}
          /> */}
        </SafeAreaView>
      </View>
      {/* <CameraProvider>
        <BottomSheetModalProvider>
          <AssistantProvider>
            <Slot />
          </AssistantProvider>
        </BottomSheetModalProvider>
      </CameraProvider> */}
    </>
  );
}

import { Event } from "@/types/calendar";
import Carousel from "@/components/Carousel";

const baseDate = new Date(2024, 8, 25); // September 25th, 2024

export const sampleEvents: Event[] = [
  {
    id: "1",
    title: "Team Meeting",
    start: new Date(2024, 8, 25, 10, 0), // September 25th, 2024, 10:00 AM
    end: new Date(2024, 8, 25, 11, 30), // September 25th, 2024, 11:30 AM
    location: "Conference Room A",
    color: "#FF9500",
  },
  {
    id: "2",
    title: "Lunch with Client",
    start: new Date(2024, 8, 25, 12, 30), // September 25th, 2024, 12:30 PM
    end: new Date(2024, 8, 25, 14, 0), // September 25th, 2024, 2:00 PM
    location: "Cafe Downtown",
    color: "#FF2D55",
  },
  {
    id: "3",
    title: "Project Kickoff",
    start: new Date(2024, 8, 26, 9, 0), // September 26th, 2024, 9:00 AM
    end: new Date(2024, 8, 26, 10, 30), // September 26th, 2024, 10:30 AM
    location: "Main Office",
    color: "#5856D6",
  },
  {
    id: "4",
    title: "Gym Session",
    start: new Date(2024, 8, 26, 18, 0), // September 26th, 2024, 6:00 PM
    end: new Date(2024, 8, 26, 19, 30), // September 26th, 2024, 7:30 PM
    location: "Fitness Center",
    color: "#FF3B30",
  },
  {
    id: "5",
    title: "Dentist Appointment",
    start: new Date(2024, 8, 27, 14, 0), // September 27th, 2024, 2:00 PM
    end: new Date(2024, 8, 27, 15, 0), // September 27th, 2024, 3:00 PM
    location: "Dental Clinic",
    color: "#34C759",
  },
  {
    id: "6",
    title: "Movie Night",
    start: new Date(2024, 8, 27, 20, 0), // September 27th, 2024, 8:00 PM
    end: new Date(2024, 8, 27, 22, 30), // September 27th, 2024, 10:30 PM
    location: "Home",
    color: "#007AFF",
  },
  {
    id: "7",
    title: "Business Workshop",
    start: new Date(2024, 8, 28, 10, 0), // September 28th, 2024, 10:00 AM
    end: new Date(2024, 8, 28, 16, 0), // September 28th, 2024, 4:00 PM
    location: "Convention Center",
    color: "#5AC8FA",
  },
  {
    id: "8",
    title: "Family Dinner",
    start: new Date(2024, 8, 28, 19, 0), // September 28th, 2024, 7:00 PM
    end: new Date(2024, 8, 28, 21, 0), // September 28th, 2024, 9:00 PM
    location: "Mom's House",
    color: "#FF9500",
  },
];
