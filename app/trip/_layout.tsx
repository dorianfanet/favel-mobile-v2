import React from "react";
import { CameraProvider } from "@/context/cameraContext";
import { Slot, Stack } from "expo-router";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { AssistantProvider } from "@/context/assistantContext";
import { TripProvider } from "@/context/tripContext";
import { BottomSheetProvider } from "@/context/bottomSheetsRefContext";

export default function Layout() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <CameraProvider>
        <BottomSheetModalProvider>
          <TripProvider>
            <AssistantProvider>
              <BottomSheetProvider>
                <Slot />
              </BottomSheetProvider>
            </AssistantProvider>
          </TripProvider>
        </BottomSheetModalProvider>
      </CameraProvider>
    </>
  );
}
