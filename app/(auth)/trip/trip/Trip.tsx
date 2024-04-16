import { View, Text, Pressable } from "react-native";
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
import ActivityModal from "./(activity)/ActivityModal";
import { padding } from "@/constants/values";
import Colors from "@/constants/Colors";
import Icon from "@/components/Icon";
import { track } from "@amplitude/analytics-react-native";

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

  useEffect(() => {
    track("Trip page viewed");
  }, []);

  return (
    <>
      {tripMetadata && tripMetadata.status === "trip.loading" && <Loading />}
      <TripBottomSheet />
      {tripMetadata && !tripMetadata.status.includes("loading") && (
        <TripChatWrapper type="trip">
          <Pressable
            style={{
              position: "absolute",
              bottom: padding * 1.5,
              right: padding * 1.5,
              backgroundColor: Colors.light.accent,
              width: 55,
              height: 55,
              borderRadius: 18,
              shadowColor: Colors.light.accent,
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.5,
              shadowRadius: 12,
              elevation: 8,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Icon
              icon={"penIcon"}
              color={"#fff"}
              size={26}
            />
          </Pressable>
        </TripChatWrapper>
      )}
      <ActivityModal />
    </>
  );
}
