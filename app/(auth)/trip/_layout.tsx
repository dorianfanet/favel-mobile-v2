import { Platform, SafeAreaView, StatusBar } from "react-native";
import React, { useEffect } from "react";
import { Slot, Stack } from "expo-router";
import { TripProvider } from "@/context/tripContext";
// import Header from "./components/Header";
import { CameraProvider } from "@/context/cameraContext";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { EditorProvider } from "@/context/editorContext";
import { TripUserRoleProvider } from "@/context/tripUserRoleContext";
import Chat from "./(chat)/Chat";
import { AssistantProvider } from "@/context/assistantContext";
import Header from "./(header)/Header";
import WeekCalendar from "./trip/testCalendar/WeekCalendar";
import Calendar from "./trip/testCalendar/Calendar";
import TestSectionList from "./trip/testSection/TestSectionList";
import StickySectionList from "./trip/testSection/TestSectionList";
import Map from "./trip/mapTest/Map";

export default function Layout() {
  useEffect(() => {
    StatusBar.setBarStyle("dark-content");
  });

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <TripProvider>
        <EditorProvider>
          <AssistantProvider>
            <BottomSheetModalProvider>
              <TripUserRoleProvider>
                <>
                  {/* <MapWrapper /> */}
                  {/* <Header /> */}
                  {/* <SafeAreaView
                    style={{
                      flex: 1,
                    }}
                  >
                    <StickySectionList />
                  </SafeAreaView> */}
                  {/* <WeekCalendar /> */}
                  {/* <Calendar /> */}
                  {/* <Slot /> */}
                  {/* {Platform.OS === "ios" && <Chat />} */}
                  <Map />
                </>
              </TripUserRoleProvider>
            </BottomSheetModalProvider>
          </AssistantProvider>
        </EditorProvider>
      </TripProvider>
    </>
  );
}

const sections = [
  { title: "Section 1", data: ["Item 1.1", "Item 1.2"] },
  { title: "Section 2", data: ["Item 2.1", "Item 2.2", "Item 2.3"] },
];

function MapWrapper() {
  return (
    <CameraProvider>
      <Map />
    </CameraProvider>
  );
}
