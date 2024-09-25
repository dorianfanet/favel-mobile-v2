import React from "react";
import MapView from "@/components/Map/MapView";
import { CameraProvider, useCamera } from "@/context/cameraContext";
import Mapbox from "@rnmapbox/maps";
import Map from "./Map";
import { View } from "@/components/Themed";
import MaskedView from "@react-native-masked-view/masked-view";
import { SafeAreaView } from "react-native-safe-area-context";
import Trip from "./Trip";
import { Stack } from "expo-router";

export default function index() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <CameraProvider>
        <Trip />
      </CameraProvider>
    </>
  );
}
