import { View, Text, SafeAreaView, StyleSheet, Dimensions } from "react-native";
import React, { useEffect } from "react";
import Icon from "@/components/Icon";
import Colors from "@/constants/Colors";
import { BlurView } from "@/components/Themed";
import { useTrip } from "@/context/tripContext";
import Animated, {
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Day } from "@/types/types";
import { padding } from "@/constants/values";
import Content from "./Content";

export default function Loading() {
  const [dayIndex, setDayIndex] = React.useState(0);

  const { trip } = useTrip();

  useEffect(() => {
    if (trip && trip.length) {
      setDayIndex(trip.length);
    }
  }, [trip]);

  return (
    <>
      <SafeAreaView
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          marginHorizontal: padding,
        }}
      >
        {/* <View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <BlurView style={styles.blurContainer}>
              <Text
                style={{
                  fontSize: 18,
                  color: Colors.dark.primary,
                  fontFamily: "Outfit_600SemiBold",
                }}
              >
                Jour {dayIndex}
              </Text>
            </BlurView>
            <BlurView
              style={[
                {
                  flexDirection: "row",
                  gap: 5,
                  justifyContent: "center",
                  alignItems: "center",
                },
                styles.blurContainer,
              ]}
            >
              <Icon
                icon="mapPinIcon"
                size={18}
                color={Colors.dark.primary}
                style={{ opacity: 0.9 }}
              />
              <Text
                style={{
                  fontSize: 14,
                  color: Colors.dark.primary,
                  fontFamily: "Outfit_500Medium",
                  opacity: 0.9,
                }}
              >
                {trip && trip[trip.length - 1].location}
              </Text>
            </BlurView>
          </View>
        </View>
         <View
          style={{
            height: 140,
          }}
        ></View> */}
        {/* {trip && trip.length && trip[trip.length - 2] && (
          <DayCard
            day={trip[trip.length - 2]}
            dayIndex={trip.length - 1}
            isPrev
          />
        )} */}
        {trip && trip.length && trip[trip.length - 1] && (
          <DayCard
            day={trip[trip.length - 1]}
            dayIndex={trip.length}
          />
        )}
      </SafeAreaView>
    </>
  );
}

function DayCard({
  day,
  dayIndex,
  isPrev,
}: {
  day: Day;
  dayIndex: number;
  isPrev?: boolean;
}) {
  const screenWidth = Dimensions.get("window").width;

  // const translateX = useSharedValue(isPrev ? 0 : screenWidth);

  // useEffect(() => {
  //   translateX.value = withTiming(isPrev ? -screenWidth : 0, { duration: 500 });
  // }, [dayIndex]);

  // const animatedStyle = useAnimatedStyle(() => {
  //   return {
  //     transform: [{ translateX: translateX.value }],
  //   };
  // });

  return (
    <SafeAreaView>
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <Animated.View
          style={[{}]}
          exiting={FadeOut}
        >
          {/* <Animated.View style={[{}, animatedStyle]}> */}
          <Content day={day} />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flex: 0,
  },
});
