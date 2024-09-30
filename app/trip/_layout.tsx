import React from "react";
import { CameraProvider } from "@/context/cameraContext";
import { Slot, Stack } from "expo-router";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { AssistantProvider } from "@/context/assistantContext";
import Calendar from "@/components/Calendar";
import { Text, View } from "@/components/Themed";
import { Dimensions, SafeAreaView } from "react-native";
import { TripProvider } from "@/context/tripContext";

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
      {/* <View
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
          
          <Calendar
            startDate={dates.startDate}
            endDate={dates.endDate}
            days={days}
            events={events}
          />
          
        </SafeAreaView>
      </View> */}
      <CameraProvider>
        <BottomSheetModalProvider>
          <AssistantProvider>
            <TripProvider>
              <Slot />
            </TripProvider>
          </AssistantProvider>
        </BottomSheetModalProvider>
      </CameraProvider>
    </>
  );
}
