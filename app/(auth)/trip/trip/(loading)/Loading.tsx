import { View, Text, SafeAreaView, StyleSheet, Dimensions } from "react-native";
import React, { useEffect, useRef } from "react";
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
import { Activity, Day, Trip } from "@/types/types";
import { padding } from "@/constants/values";
import Content from "./Content";
import { getActivity, supabase } from "@/lib/supabase";

export default function Loading() {
  const [dayIndex, setDayIndex] = React.useState(0);

  const { trip, setTrip, tripMetadata } = useTrip();
  const tripCopy = useRef<Trip>([]);
  const isActive = useRef(true); // Used to control the loop internally

  // useEffect(() => {
  //   // Initialize or reset tripCopy on each effect run
  //   tripCopy.current = [];

  //   async function run() {
  //     while (isActive.current) {
  //       console.log("Running interval");
  //       const { data, error } = await supabase
  //         .from("queue")
  //         .select("id, data")
  //         .eq("trip_id", tripMetadata?.id)
  //         .order("created_at", { ascending: true });

  //       if (error) {
  //         console.error(error);
  //         break; // Stop the loop on error
  //       }

  //       if (data[0]) {
  //         try {
  //           const payload = data[0].data as Day | Activity;
  //           console.log("Payload:", payload, "activities" in payload);
  //           if ("activities" in payload) {
  //             tripCopy.current.push(payload);
  //           } else {
  //             const lastDay = tripCopy.current[tripCopy.current.length - 1];
  //             if (lastDay.activities) {
  //               tripCopy.current[tripCopy.current.length - 1].activities?.push(
  //                 payload as Activity
  //               );
  //             }
  //           }
  //           async function getTrip() {
  //             const newTrip = await Promise.all(
  //               tripCopy.current.map(async (day: Day, index: number) => {
  //                 if (day.activities) {
  //                   if (day.activities.length === 0) return day;
  //                   const activities = await Promise.all(
  //                     day.activities.map(async (activity) => {
  //                       if (activity.route) {
  //                         return activity;
  //                       } else {
  //                         const newActivity = await getActivity(activity);
  //                         return newActivity;
  //                       }
  //                     })
  //                   );
  //                   return { ...day, activities };
  //                 } else {
  //                   return day;
  //                 }
  //               })
  //             );
  //             console.log(newTrip);
  //             setTrip(newTrip as Day[]);
  //           }
  //           getTrip();
  //           const { error } = await supabase
  //             .from("queue")
  //             .delete()
  //             .eq("id", data[0].id);
  //           if (error) {
  //             console.error(error);
  //             return;
  //           }
  //         } catch (e) {
  //           console.error(e);
  //         }
  //       }

  //       // Wait for 2 seconds before the next iteration
  //       await new Promise((resolve) => setTimeout(resolve, 1500));

  //       // Check isActive again to ensure loop can exit if component unmounts
  //       if (!isActive.current) {
  //         console.log("Loop stopped because the component was unmounted.");
  //         break;
  //       }
  //     }
  //   }

  //   // Start the loop
  //   run();

  //   // Cleanup function
  //   return () => {
  //     isActive.current = false; // Ensure the loop stops when the component unmounts
  //     console.log("Component unmounted and loop should be stopped.");
  //   };
  // }, []);

  // useEffect(() => {
  //   if (!tripMetadata) return;
  //   console.log("Subscribing to channel");
  //   const channel = supabase.channel(`queue-${tripMetadata.id}`).on(
  //     "postgres_changes",
  //     {
  //       event: "INSERT",
  //       schema: "public",
  //       table: "queue_day",
  //       // filter: `trip_id=eq.${tripMetadata.id}`,
  //     },
  //     (payload) => {
  //       console.log("New day payload", payload.new);
  //       const day = payload.new as Day;
  //       let newDay: Day | null = null;
  //       // if (day.activities) {
  //       //   if (day.activities.length === 0) return day;
  //       //   const activities = await Promise.all(
  //       //     day.activities.map(async (activity) => {
  //       //       if (activity.route) {
  //       //         return activity;
  //       //       } else {
  //       //         const newActivity = await getActivity(activity);
  //       //         return newActivity;
  //       //       }
  //       //     })
  //       //   );
  //       //   newDay = { ...day, activities };
  //       // } else {
  //       //   newDay = day;
  //       // }
  //       // if (newDay) {
  //       //   setTrip((prev) => {
  //       //     if (prev) {
  //       //       return [...(prev as Trip), newDay];
  //       //     } else {
  //       //       return [newDay];
  //       //     }
  //       //   });
  //       // }
  //     }
  //   );

  //   return () => {
  //     channel.unsubscribe();
  //   };
  // }, [tripMetadata]);

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
