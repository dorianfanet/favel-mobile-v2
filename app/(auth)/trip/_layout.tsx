import { View, Text, StatusBar } from "react-native";
import React, { useEffect } from "react";
import { Slot, Stack } from "expo-router";
import { TripProvider } from "@/context/tripContext";
import Header from "./components/Header";
import Map from "./(map)/Map";
import { CameraProvider } from "@/context/cameraContext";

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
        <>
          <MapWrapper />
          <Slot />
          <Header />
        </>
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
