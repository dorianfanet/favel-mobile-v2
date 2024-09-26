import { View, Text, Dimensions, useColorScheme } from "react-native";
import React, { useCallback, useEffect, useMemo } from "react";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BackgroundView } from "@/components/Themed";
import { useSharedValue } from "react-native-reanimated";
import Calendar from "@/components/Calendar";
import { Day, Event } from "@/types/trip";
import { useFocusEffect } from "expo-router";
import Colors from "@/constants/Colors";

const { height } = Dimensions.get("window");

const dates = {
  startDate: new Date(2024, 8, 25),
  endDate: new Date(2024, 8, 29),
};

export default function BottomSheets({
  onChange,
}: {
  onChange: (i: number) => void;
}) {
  const inset = useSafeAreaInsets();

  const calendarModalRef = React.useRef<BottomSheetModal>(null);

  useEffect(() => {
    calendarModalRef.current?.present();
  }, []);

  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
    if (index === 1) {
      onChange(index);
    } else {
      onChange(index);
    }
  }, []);

  const animatedPosition = useSharedValue(0);

  console.log(animatedPosition.value);

  const [days, setDays] = React.useState<Day[]>([
    {
      id: "1",
      date: new Date(2024, 8, 25),
      name: "Fisherman's Wharf",
      centerPoint: {
        latitude: 37.808,
        longitude: -122.416,
      },
    },
    {
      id: "2",
      date: new Date(2024, 8, 26),
      name: "Golden Gate Park",
      centerPoint: {
        latitude: 37.769,
        longitude: -122.486,
      },
    },
    {
      id: "3",
      date: new Date(2024, 8, 27),
      name: "Chinatown",
      centerPoint: {
        latitude: 37.794,
        longitude: -122.407,
      },
    },
    {
      id: "4",
      date: new Date(2024, 8, 28),
      name: "Union Square",
      centerPoint: {
        latitude: 37.788,
        longitude: -122.407,
      },
    },
  ]);

  const [events, setEvents] = React.useState<Event[]>([
    {
      id: "5367",
      start: new Date(2024, 8, 25, 10, 0),
      end: new Date(2024, 8, 25, 11, 30),
      title: "Fisherman's Wharf",
      dayId: "1",
    },
    {
      id: "5368",
      start: new Date(2024, 8, 25, 12, 0),
      end: new Date(2024, 8, 25, 13, 30),
      title: "Lunch",
      dayId: "1",
    },
    {
      id: "5369",
      start: new Date(2024, 8, 25, 14, 0),
      end: new Date(2024, 8, 25, 15, 30),
      title: "Golden Gate Park",
      dayId: "2",
    },
    {
      id: "5370",
      start: new Date(2024, 8, 25, 16, 0),
      end: new Date(2024, 8, 25, 17, 30),
      title: "Dinner",
      dayId: "2",
    },
    {
      dayId: "3",
      end: new Date(2024, 8, 25, 17, 30),
      id: "5370",
      start: new Date(2024, 8, 25, 16, 0),
      title: "Dinner",
    },
    {
      id: "5371",
      start: new Date(2024, 8, 25, 18, 0),
      end: new Date(2024, 8, 25, 19, 30),
      title: "Union Square",
      dayId: "4",
    },
  ]);

  const offsetHeight = useMemo(() => {
    return height - inset.top - 120;
  }, [inset]);

  const theme = useColorScheme();

  return (
    <BottomSheetModal
      ref={calendarModalRef}
      index={0}
      snapPoints={[150, offsetHeight]}
      handleHeight={0}
      handleComponent={() => (
        <View
          style={{
            width: "100%",
            height: 0,
          }}
        ></View>
      )}
      onChange={handleSheetChanges}
      onAnimate={handleSheetChanges}
      enableDismissOnClose={false}
      enablePanDownToClose={false}
      backgroundStyle={{
        borderRadius: 21,
      }}
      animatedPosition={animatedPosition}
      style={{
        shadowColor: Colors.light.text.primary,
        shadowOffset: {
          width: 0,
          height: 0,
        },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 20,
      }}
    >
      <View
        style={{
          flex: 1,
          borderRadius: 20,
          overflow: "hidden",
        }}
      >
        <BackgroundView
          style={{
            width: "100%",
            height: height,
            alignItems: "center",
            pointerEvents: "box-none",
            transform: [{ translateY: -(inset.top + 120) }],
          }}
        ></BackgroundView>
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <Calendar
            startDate={dates.startDate}
            endDate={dates.endDate}
            days={days}
            events={events}
            height={offsetHeight}
          />
        </View>
      </View>
    </BottomSheetModal>
  );
}
