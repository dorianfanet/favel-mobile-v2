import { View, Text } from "react-native";
import React, { useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import New from "./new/New";
import Trip from "./trip/Trip";
import { supabase } from "@/lib/supabase";
import { useTrip } from "@/context/tripContext";
import { TripMetadata } from "@/types/types";

enum Action {
  NEW = "new",
  TRIP = "trip",
}

export default function Rest() {
  const { rest } = useLocalSearchParams();
  const action = rest[1] as Action;

  const { setTripMetadata, setTrip } = useTrip();

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
              setTrip(payload.new.trip);
            }
          }
        }
      )
      // .on(
      //   "postgres_changes",
      //   {
      //     event: "INSERT",
      //     schema: "public",
      //     table: "tripv2_edits",
      //     filter: `trip_id=eq.${id}`,
      //   },
      //   (payload) => {
      //     if (payload.new as TripEdit) {
      //       console.log(payload.new);
      //       // @ts-ignore
      //       setTripEdits((prev) => [payload.new, ...prev]);
      //       if (payload.new.type === "move" || payload.new.type === "delete") {
      //         console.log("new payload ", payload.new);
      //         Toast.show({
      //           type: "custom",
      //           props: {
      //             tripEdit: payload.new,
      //           },
      //         });
      //       }
      //     }
      //   }
      // )
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
