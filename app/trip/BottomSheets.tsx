import {
  View,
  Dimensions,
  useColorScheme,
  Touchable,
  TouchableOpacity,
  Pressable,
} from "react-native";
import React, { useCallback, useEffect, useMemo } from "react";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BackgroundView, Text } from "@/components/Themed";
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Calendar from "@/components/Calendar";
import { TripDay, TripEvent } from "@/types/trip";
import { useFocusEffect } from "expo-router";
import Colors from "@/constants/Colors";
import { padding } from "@/constants/values";
import { Circle, Svg, Text as SvgText } from "react-native-svg";
import useTheme from "@/hooks/useTheme";

const { height } = Dimensions.get("window");

const dates = {
  startDate: new Date(2024, 8, 25),
  endDate: new Date(2024, 8, 29),
};

export default function BottomSheets({
  tripDays,
  tripEvents,
  loading,
}: {
  tripDays: TripDay[];
  tripEvents: TripEvent[];
  loading: boolean;
}) {
  const inset = useSafeAreaInsets();

  const calendarModalRef = React.useRef<BottomSheetModal>(null);

  useEffect(() => {
    calendarModalRef.current?.present();
  }, []);

  const animatedPosition = useSharedValue(0);

  const offsetHeight = useMemo(() => {
    return height - inset.top - 120;
  }, [inset]);

  const { theme } = useTheme();

  useEffect(() => {
    if (!loading) {
      // console.log("present");
      calendarModalRef.current?.snapToIndex(0);
    }
  }, [loading]);

  return (
    <BottomSheetModal
      ref={calendarModalRef}
      index={-1}
      snapPoints={[150, offsetHeight]}
      handleComponent={() => (
        <View
          style={{
            width: "100%",
            height: 0,
          }}
        >
          {/* <Pressable
            style={{
              position: "absolute",
              top: -70,
              width: "100%",
              height: 70,
              padding: padding,
              overflow: "hidden",
              justifyContent: "flex-end",
            }}
            onPress={() => {
              citySize.value = citySize.value === 14 ? 18 : 14;
              dayTranslateY.value = dayTranslateY.value === 0 ? -4 : 0;
              dayOpacity.value = dayOpacity.value === 0 ? 1 : 0;
            }}
          >
            <Animated.Text
              style={[
                {
                  fontFamily: "Outfit_600SemiBold",
                  color: Colors[theme].text.primary,
                  fontSize: 18,
                  position: "absolute",
                  bottom: 35,
                  left: padding,
                },
                animatedDayStyle,
              ]}
            >
              Golden Gate Park
            </Animated.Text>
            <Animated.Text
              style={[
                {
                  fontFamily: "Outfit_600SemiBold",
                  color: Colors[theme].text.primary,
                },
                animatedCityStyle,
              ]}
            >
              San Francisco
            </Animated.Text>
          </Pressable> */}
        </View>
      )}
      enableDismissOnClose={false}
      enablePanDownToClose={false}
      backgroundStyle={{
        borderRadius: 21,
      }}
      animatedPosition={animatedPosition}
      style={{
        backgroundColor: Colors[theme].background.primary,
        shadowColor: "#03121b",
        shadowOffset: {
          width: 0,
          height: 0,
        },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 20,
        borderRadius: 20,
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
            days={tripDays}
            events={tripEvents}
            height={offsetHeight}
          />
        </View>
      </View>
    </BottomSheetModal>
  );
}
