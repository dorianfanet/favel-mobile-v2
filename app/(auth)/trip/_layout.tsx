import { View, Text, StatusBar } from "react-native";
import React, { useEffect } from "react";
import { Slot, Stack } from "expo-router";
import { TripProvider } from "@/context/tripContext";
import Header from "./components/Header";
import Map from "./(map)/Map";
import { CameraProvider } from "@/context/cameraContext";
import { MMKVLoader, useMMKVStorage } from "react-native-mmkv-storage";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import Colors from "@/constants/Colors";
import { EditorProvider } from "@/context/editorContext";
import { track } from "@amplitude/analytics-react-native";
import { TripUserRoleProvider } from "@/context/tripUserRoleContext";

export const MMKV = new MMKVLoader().initialize();

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
        <BottomSheetModalProvider>
          <EditorProvider>
            <TripUserRoleProvider>
              <>
                <MapWrapper />
                <Header />
                <Slot />
              </>
            </TripUserRoleProvider>
          </EditorProvider>
        </BottomSheetModalProvider>
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
