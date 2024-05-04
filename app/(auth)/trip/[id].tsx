import { View, Text, ActivityIndicator, Alert } from "react-native";
import React, { useEffect } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useTrip } from "@/context/tripContext";
import Colors from "@/constants/Colors";
import { getActivity, supabase } from "@/lib/supabase";
import { Day, TripMetadata } from "@/types/types";
import { useUser } from "@clerk/clerk-expo";
import { BlurView } from "@/components/Themed";
import { MMKV } from "./_layout";
import { track } from "@amplitude/analytics-react-native";
import { useTripUserRole } from "@/context/tripUserRoleContext";

export default function Index() {
  const { id } = useLocalSearchParams();
  const { user } = useUser();

  const { setTripMetadata, setTrip } = useTrip();
  const { setTripUserRole } = useTripUserRole();

  const router = useRouter();

  async function createTrip() {
    const { data, error } = await supabase
      .from("trips_v2")
      .insert([
        { id, author_id: user?.id, status: "new", name: "Nouveau voyage" },
      ]);
    if (error) {
      console.error(error);
    } else {
      setTripMetadata({
        id: id as string,
        status: "new",
        name: "Nouveau voyage",
      });
      router.navigate(`/(auth)/trip/${id}/new`);
    }
  }

  useEffect(() => {
    async function checkForTrip() {
      const { data, error } = await supabase
        .from("trips_v2")
        .select(
          "id, trip, status, preferences, route, status_message, prompt, name, dates, author_id, invited_ids, post_id"
        )
        .eq("id", id)
        .single();
      if (data) {
        if (data.author_id !== user?.id) {
          if (
            data.invited_ids !== null &&
            data.invited_ids.includes(user?.id)
          ) {
            console.log("🎉 User is invited to the trip");
            setTripUserRole({
              id: user!.id,
              role: "traveler",
            });
          } else {
            // router.navigate("/home");
            // Alert.alert("Vous n'êtes pas autorisé à voir ce voyage");
            // return;
            setTripUserRole({
              id: user!.id,
              role: "read-only",
            });
          }
        } else {
          setTripUserRole({
            id: user!.id,
            role: "author",
          });
        }
        setTripMetadata(data as TripMetadata);
        if (data.trip) {
          async function getTrip() {
            const newTrip = await Promise.all(
              data!.trip.map(async (day: Day, index: number) => {
                if (day.activities) {
                  if (day.activities.length === 0) return day;
                  const activities = await Promise.all(
                    day.activities.map(async (activity) => {
                      if (activity.route) {
                        return activity;
                      } else {
                        const newActivity = await getActivity(activity, true);
                        return newActivity;
                      }
                    })
                  );
                  return { ...day, activities };
                } else {
                  return day;
                }
              })
            );
            setTrip(newTrip as Day[]);
          }
          getTrip();
        }
        router.navigate(`/(auth)/trip/${id}/trip`);
      } else {
        await createTrip();
      }
    }

    checkForTrip();
  }, []);

  useEffect(() => {
    track("Trip page viewed", {
      tripId: id,
    });
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        width: "100%",
        height: "100%",
      }}
    >
      <BlurView
        style={{
          padding: 20,
          paddingVertical: 40,
          flex: 0,
        }}
      >
        <ActivityIndicator
          color={"white"}
          size={"large"}
        />
        <Text
          style={{
            color: "white",
            fontSize: 20,
            fontFamily: "Outfit_600SemiBold",
            textAlign: "center",
            marginTop: 20,
          }}
        >
          Chargement de votre voyage...
        </Text>
      </BlurView>
    </View>
  );
}
