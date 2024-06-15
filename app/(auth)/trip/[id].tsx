import { View, Text } from "react-native";
import React, { useEffect } from "react";
import { useTrip } from "@/context/tripContext";
import { Stack, useLocalSearchParams } from "expo-router";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { createClient } from "@supabase/supabase-js";
import { Day, TripEdit, TripMetadata } from "@/types/types";
import { getActivity } from "@/lib/supabase";
import Toast from "react-native-toast-message";
import { useTripUserRole } from "@/context/tripUserRoleContext";
import { supabaseClient } from "@/lib/supabaseClient";
import New from "./new/New";
import Trip from "./trip/Trip";
import Loading from "./trip/loading/Loading";
// import { AppEventsLogger } from "react-native-fbsdk-next";

export default function Index() {
  const { user } = useUser();
  const { tripMetadata, setTripMetadata, setTrip } = useTrip();
  const { id } = useLocalSearchParams();
  const { setTripUserRole } = useTripUserRole();
  const { getToken } = useAuth();

  useEffect(() => {
    if (tripMetadata) return;

    async function checkForTrip() {
      await supabaseClient(getToken).then(async (supabase) => {
        const { data, error } = await supabase
          .from("trips_v2")
          .select(
            "id, trip, status, preferences, route, status_message, prompt, name, dates, author_id, invited_ids, post_id, conversation_id"
          )
          .eq("id", id)
          .single();

        if (error) {
          console.error(error);
        }

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
        } else {
          await supabaseClient(getToken).then(async (supabase) => {
            setTripMetadata({
              id: id as string,
              status: "new",
              name: "Nouveau voyage",
            });
            setTripUserRole({
              id: user!.id,
              role: "author",
            });
            const { data, error } = await supabase.from("trips_v2").insert([
              {
                id,
                author_id: user?.id,
                status: "new",
                name: "Nouveau voyage",
              },
            ]);
            if (error) {
              console.error(error);
            }
          });
        }
      });
    }

    checkForTrip();
  }, []);

  // useEffect(() => {
  //   AppEventsLogger.logEvent(AppEventsLogger.AppEvents.CompletedRegistration, {
  //     [AppEventsLogger.AppEventParams.RegistrationMethod]: "test",
  //   });
  // }, []);

  return (
    <>
      {tripMetadata ? (
        <>
          {tripMetadata.status.startsWith("new") && <New />}
          {tripMetadata.status.startsWith("trip") && <Trip id={id as string} />}
        </>
      ) : null}
    </>
  );
}
