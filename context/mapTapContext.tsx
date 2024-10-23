import React from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";

interface MapTapContextType {
  setMarkerTapped: React.Dispatch<React.SetStateAction<boolean>>;
}

const MapTapContext = React.createContext<MapTapContextType | null>(null);

export const MapTapProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [markerTapped, setMarkerTapped] = React.useState(false);

  const gesture = Gesture.Tap().onTouchesUp(() => {
    if (markerTapped) {
      console.log("Marker tapped");
    } else {
      console.log("Map tapped");
    }
    runOnJS(setMarkerTapped)(false);
  });

  return (
    <MapTapContext.Provider value={{ setMarkerTapped }}>
      <GestureDetector gesture={gesture}>{children}</GestureDetector>
    </MapTapContext.Provider>
  );
};

export const useMapTap = () => {
  const context = React.useContext(MapTapContext);
  if (!context) {
    throw new Error("useMapTap must be used within a MapTapProvider");
  }
  return context;
};
