import React, { useCallback } from "react";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { BackgroundView, Text, View } from "@/components/Themed";
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
import Colors from "@/constants/Colors";
import useTheme from "@/hooks/useTheme";
import { TripCard } from "@/app/home/TripList";

const { height } = Dimensions.get("window");

type DiscoverySheetProps = {
  sheetRef: React.RefObject<BottomSheet>;
  offsetHeight: number;
};

const collapsedHeight = height * 0.3;

function DiscoverySheet({ sheetRef, offsetHeight }: DiscoverySheetProps) {
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

  const { theme } = useTheme();

  return (
    <>
      <Sheet
        sheetRef={sheetRef}
        BackdropComponent={({ position }) => renderBackdrop(position)}
        offsetHeight={offsetHeight}
        initialIndex={-1}
        snapPoints={[collapsedHeight, offsetHeight]}
        animPosition={animPosition}
        // enablePanDownToClose
        // onClose={() => openSheet("calendar")}
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
              flex: 1,
              width: "100%",
            }}
          >
            <View
              style={{
                width: "100%",
                height: 50,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text fontStyle="subtitle">For you</Text>
              <View
                style={{
                  position: "absolute",
                  width: "100%",
                  height: 1,
                  backgroundColor: Colors[theme || "light"].text.primary,
                  bottom: 0,
                  opacity: 0.3,
                }}
              ></View>
            </View>
            <BottomSheetScrollView
              style={{
                flex: 1,
                backgroundColor: "transparent",
                paddingVertical: 20,
                gap: 20,
              }}
            >
              <TripCard
                trip={{
                  id: "17d26789-4532-4da5-bbe3-c64d424f3c84",
                  name: "California road trip",
                  thumbnail:
                    "https://www.tuningblog.eu/wp-content/uploads/2023/03/PACIFIC-COAST-HIGHWAY-KALIFORNIEN-Roadtrip.jpg",
                  createdAt: "2024-10-01T18:34:24.089Z",
                  creatorId: "user_2mqcUIkf3zpjVzl576Zys56r3hU",
                  departureDate: "2024-11-03T23:00:00.000Z",
                  returnDate: "2024-11-06T23:00:00.000Z",
                }}
              />
              <TripCard
                trip={{
                  id: "17d26789-4532-4da5-bbe3-c64d424f3c84",
                  name: "California road trip",
                  thumbnail:
                    "https://www.tuningblog.eu/wp-content/uploads/2023/03/PACIFIC-COAST-HIGHWAY-KALIFORNIEN-Roadtrip.jpg",
                  createdAt: "2024-10-01T18:34:24.089Z",
                  creatorId: "user_2mqcUIkf3zpjVzl576Zys56r3hU",
                  departureDate: "2024-11-03T23:00:00.000Z",
                  returnDate: "2024-11-06T23:00:00.000Z",
                }}
              />
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

export default React.memo(DiscoverySheet);
