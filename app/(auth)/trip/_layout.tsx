import { Platform, StatusBar } from "react-native";
import React, { useEffect } from "react";
import { Slot, Stack } from "expo-router";
import { TripProvider } from "@/context/tripContext";
import Header from "./components/Header";
import { CameraProvider } from "@/context/cameraContext";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { EditorProvider } from "@/context/editorContext";
import { TripUserRoleProvider } from "@/context/tripUserRoleContext";
import Map from "./(map)/Map";
import Chat from "./(chat)/Chat";
import { AssistantProvider } from "@/context/assistantContext";

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
                  <MapWrapper />
                  <Header />
                  <Slot />
                  {Platform.OS === "ios" && <Chat />}
                </>
              </TripUserRoleProvider>
            </BottomSheetModalProvider>
          </AssistantProvider>
        </EditorProvider>
      </TripProvider>
    </>
  );
}

function MapWrapper() {
  return (
    <CameraProvider>
      <Map />
    </CameraProvider>
  );
}
