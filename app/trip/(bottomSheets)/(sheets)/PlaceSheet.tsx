import React, { useCallback } from "react";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { BackgroundView, View } from "@/components/Themed";
import Sheet from "../Sheet";
import { Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Calendar from "@/components/Calendar";
import { TripDay, TripEvent } from "@/types/trip";
import ImageWithFallback from "@/components/ImageWithFallback";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { headerHeight } from "@/constants/values";
import { useBottomSheetRefs } from "@/context/bottomSheetsRefContext";
import Place from "@/components/Place";

const { height } = Dimensions.get("window");

type PlaceSheetProps = {
  sheetRef: React.RefObject<BottomSheet>;
  offsetHeight: number;
};

const collapsedHeight = height * 0.5;

function PlaceSheet({ sheetRef, offsetHeight }: PlaceSheetProps) {
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
              backgroundColor: "red",
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

  const animPosition = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: animPosition ? animPosition.value : 0,
    };
  });

  const { openSheet } = useBottomSheetRefs();

  return (
    <>
      <Sheet
        sheetRef={sheetRef}
        BackdropComponent={({ position }) => renderBackdrop(position)}
        offsetHeight={offsetHeight + 50 + inset.top}
        initialIndex={-1}
        snapPoints={[collapsedHeight, offsetHeight + 50 + inset.top]}
        animPosition={animPosition}
        enablePanDownToClose
        onClose={() => openSheet("calendar")}
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
              transform: [{ translateY: 0 }],
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
            <BottomSheetScrollView>
              <Place heroHeight={collapsedHeight} />
            </BottomSheetScrollView>
          </View>
        </View>
      </Sheet>
      {/* <Animated.View
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
        <MaskedView
          maskElement={
            <View
              style={[
                {
                  width: "100%",
                  height: inset.top + headerHeight + 50,
                  pointerEvents: "none",
                },
              ]}
            >
              <View
                style={{
                  width: "100%",
                  height: inset.top,
                  backgroundColor: "black",
                }}
              />
              <LinearGradient
                colors={["black", "transparent"]}
                locations={[0, 1]}
                style={{ flex: 1, pointerEvents: "none" }}
              />
            </View>
          }
          style={{
            flex: 1,
          }}
        >
          <BackgroundView
            style={{
              flex: 1,
            }}
          />
        </MaskedView>
      </Animated.View> */}
    </>
  );
}

export default React.memo(PlaceSheet);
