import { View, Text } from "react-native";
import React, { useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import New from "./new/New";
import Trip from "./trip/Trip";
import { getActivity, supabase } from "@/lib/supabase";
import { useTrip } from "@/context/tripContext";
import {
  Day,
  TripEdit,
  TripMetadata,
  UserActivity,
  UserActivityState,
} from "@/types/types";
import Toast from "react-native-toast-message";
import { useUser } from "@clerk/clerk-expo";

enum Action {
  NEW = "new",
  TRIP = "trip",
}

export default function Rest() {
  const { rest } = useLocalSearchParams();
  console.log(rest);
  const action = rest[1] as Action;

  const { setTripMetadata, setTrip, setTripEdits } = useTrip();

  const { user } = useUser();

  const id = rest[0];

  useEffect(() => {
    const channel = supabase
      .channel(`${id}-trip`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "trips_v2",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          if (payload.new) {
            console.log(payload.new);
            setTripMetadata(payload.new as TripMetadata);
            if (payload.new.trip) {
              async function getTrip() {
                const newTrip = await Promise.all(
                  payload.new.trip.map(async (day: Day, index: number) => {
                    if (day.activities) {
                      if (day.activities.length === 0) return day;
                      const activities = await Promise.all(
                        day.activities.map(async (activity) => {
                          if (activity.route) {
                            console.log(
                              ` 🚘 Activity ${activity.id} has a route\n`
                            );
                            return activity;
                          } else {
                            console.log(
                              ` 📍 Activity ${activity.id} is a place`
                            );
                            const newActivity = await getActivity(activity);
                            console.log(`   - Id: ${newActivity.id},
                    - Name: ${newActivity.name},
                    - Category: ${newActivity.category},
                    - Coordinates: ${newActivity.coordinates?.latitude}, ${newActivity.coordinates?.longitude},
                    - Duration: ${newActivity.avg_duration},
                    - DCategory: ${newActivity.display_category},\n`);
                            return newActivity;
                          }
                        })
                      );
                      return { ...day, activities };
                    } else {
                      console.log(`❌ Day ${index} has no activities\n`);
                      return day;
                    }
                  })
                );
                console.log(newTrip);
                setTrip(newTrip as Day[]);
              }
              getTrip();
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tripv2_edits",
          filter: `trip_id=eq.${id}`,
        },
        (payload) => {
          if (payload.new as TripEdit) {
            console.log(payload.new);
            // @ts-ignore
            setTripEdits((prev: TripEdit[]): TripEdit[] => {
              return [...(prev as TripEdit[]), payload.new as TripEdit];
            });
            if (payload.new.type === "move" || payload.new.type === "delete") {
              console.log("new payload ", payload.new);
              if (payload.new.author_id !== user!.id) {
                Toast.show({
                  type: "custom",
                  props: {
                    tripEdit: payload.new,
                  },
                });
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  return (
    <>
      {action === Action.NEW && <New />}
      {action === Action.TRIP && <Trip />}
    </>
  );
}
