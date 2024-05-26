import { View, Text, Pressable } from "react-native";
import React, { useEffect } from "react";
import { useTrip } from "@/context/tripContext";
import { useLocalSearchParams } from "expo-router";
import TripBottomSheet from "./TripBottomSheet";
import Loading from "./(loading)/Loading";
import TripChatWrapper from "./(chat)/TripChatWrapper";
import { useAuth, useUser } from "@clerk/clerk-expo";
import ActivityModal from "./(activity)/ActivityModal";
import { padding } from "@/constants/values";
import Colors from "@/constants/Colors";
import Icon from "@/components/Icon";
import { track } from "@amplitude/analytics-react-native";
import { MMKV } from "@/app/_layout";
import { useTripUserRole } from "@/context/tripUserRoleContext";
import { supabaseClient } from "@/lib/supabaseClient";
import { favelClient } from "@/lib/favelApi";

export default function Trip() {
  const { trip, tripMetadata, setUserActivity } = useTrip();
  const { user } = useUser();
  const { tripUserRole } = useTripUserRole();

  const { rest } = useLocalSearchParams();

  const { getToken } = useAuth();

  const id = rest[0];

  useEffect(() => {
    if (trip) return;

    if (
      tripMetadata &&
      tripMetadata.prompt &&
      tripMetadata.status === "trip.init" &&
      tripMetadata.route &&
      user?.id
    ) {
      console.log("creating trip");
      favelClient(getToken).then((favel) => {
        if (tripMetadata.prompt && tripMetadata.route) {
          favel.createTrip(
            tripMetadata.prompt,
            id,
            tripMetadata.route,
            user.id
          );
        }
      });
    }

    // if (
    //   tripMetadata &&
    //   !tripMetadata.post_id &&
    //   user &&
    //   tripMetadata.status === "trip"
    // ) {
    //   console.log("creating post");
    //   favel.createNewTripPost(id, user.id);
    // }
  }, [tripMetadata]);

  useEffect(() => {
    const interval = setInterval(async () => {
      await supabaseClient(getToken).then(async (supabase) => {
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
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    track("Trip page viewed", {
      tripId: id,
    });
    console.log("setting last opened trip", id);
    MMKV.setString("lastOpenedTrip", id as string);
  }, []);

  return (
    <>
      {tripMetadata && tripMetadata.status === "trip.loading" && <Loading />}
      <TripBottomSheet />
      {/* {tripMetadata &&
      !tripMetadata.status.includes("loading") &&
      tripUserRole.role !== "read-only" ? (
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
      ) : null} */}
      <ActivityModal />
    </>
  );
}
