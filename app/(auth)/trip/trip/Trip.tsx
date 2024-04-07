import { View, Text } from "react-native";
import React, { useEffect } from "react";
import { useTrip } from "@/context/tripContext";
import { favel } from "@/lib/favelApi";
import { useLocalSearchParams } from "expo-router";
import TripBottomSheet from "./TripBottomSheet";
import Loading from "./(loading)/Loading";
import TripChatWrapper from "./(chat)/TripChatWrapper";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/clerk-expo";
import { UserActivityState } from "@/types/types";

export default function Trip() {
  const { trip, tripMetadata, setUserActivity } = useTrip();
  const { user } = useUser();

  const { rest } = useLocalSearchParams();

  const id = rest[0];

  useEffect(() => {
    if (trip) return;

    if (
      tripMetadata &&
      tripMetadata.prompt &&
      tripMetadata.status === "trip.init" &&
      tripMetadata.route
    ) {
      console.log("creating trip");
      favel.createTrip(tripMetadata.prompt, id, tripMetadata.route);
    }
  }, [tripMetadata]);

  useEffect(() => {
    const interval = setInterval(async () => {
      console.log("ping");
      const { error } = await supabase.from("user_activity").upsert([
        {
          id: `${id}-${user?.id}`,
          last_activity: new Date(),
          trip_id: id,
          user_id: user?.id,
        },
      ]);
      if (error) {
        console.log(error);
      }

      const date12SecondsAgo = new Date(new Date().getTime() - 12000);
      const { data } = await supabase
        .from("user_activity")
        .select("*")
        .eq("trip_id", id)
        .gt("last_activity", date12SecondsAgo.toISOString())
        .not("user_id", "eq", user?.id);

      console.log(data);

      if (data) {
        setUserActivity({
          count: data.length,
          activity: data,
        });
      }
      // setUserActivity((prev) => {
      //   let count = 0;

      // Object.values(payload.new).forEach(activity => {
      //   const activityDate = new Date(activity.last_activity);
      //   const diffInSeconds = (now.getTime() - activityDate.getTime()) / 1000;
      //   if (diffInSeconds < 12) {
      //     count++;
      //   }
      // });
      //   const temp: UserActivityState = {
      //     count: 1,
      //     activity: {
      //       ...prev?.activity,
      //       [payload.new.user_id]: payload.new,
      //     },
      //   };
      //   return { ...temp };
      // });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {tripMetadata && tripMetadata.status === "trip.loading" && <Loading />}
      <TripBottomSheet />
      {tripMetadata && !tripMetadata.status.includes("loading") && (
        <TripChatWrapper />
      )}
    </>
  );
}
