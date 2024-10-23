import React, { useCallback } from "react";
import BottomSheet from "@gorhom/bottom-sheet";
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { BackgroundView, View } from "@/components/Themed";
import Sheet from "../Sheet";
import { Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Calendar from "@/components/Calendar";
import { TripDay, TripEvent } from "@/types/trip";
import { useBottomSheetRefs } from "@/context/bottomSheetsRefContext";

const { height } = Dimensions.get("window");

const collapsedHeight = height * 0.3;

type CalendarSheetProps = {
  sheetRef: React.RefObject<BottomSheet>;
  offsetHeight: number;
  tripDays: TripDay[];
  tripEvents: TripEvent[];
};

function CalendarSheet({
  sheetRef,
  offsetHeight,
  tripDays,
  tripEvents,
}: CalendarSheetProps) {
  const inset = useSafeAreaInsets();

  const renderBackdrop = useCallback(
    (position: Readonly<SharedValue<number>>) => {
      const animatedStyle = useAnimatedStyle(() => {
        return {
          opacity: position.value,
        };
      });

      return (
        <Animated.View
          style={[
            {
              position: "absolute",
              flex: 1,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: "none",
              opacity: 0,
            },
            animatedStyle,
          ]}
        >
          <BackgroundView
            style={{
              flex: 1,
            }}
          />
        </Animated.View>
      );
    },
    []
  );

  return (
    <Sheet
      sheetRef={sheetRef}
      BackdropComponent={({ position }) => renderBackdrop(position)}
      offsetHeight={offsetHeight}
      snapPoints={[collapsedHeight, offsetHeight]}
    >
      <View
        style={{
          flex: 1,
          overflow: "hidden",
        }}
      >
        <BackgroundView
          style={{
            width: "100%",
            height: height,
            alignItems: "center",
            pointerEvents: "box-none",
            transform: [{ translateY: -(inset.top + 50) }],
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
            days={tripDays}
            events={tripEvents}
            height={offsetHeight}
          />
        </View>
      </View>
    </Sheet>
  );
}

export default React.memo(CalendarSheet);
