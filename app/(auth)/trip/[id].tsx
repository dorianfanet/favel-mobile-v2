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
import { getRouteValidationText } from "@/lib/utils";
import { useAssistant } from "@/context/assistantContext";
// import { AppEventsLogger } from "react-native-fbsdk-next";

export default function Index() {
  const { user } = useUser();
  const { tripMetadata, setTripMetadata, setTrip } = useTrip();
  const { id } = useLocalSearchParams();
  const { setTripUserRole } = useTripUserRole();
  const { getToken } = useAuth();
  const { replaceAssistant } = useAssistant();

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
              try {
                const newTrip = await Promise.all(
                  data!.trip.map(async (day: Day, index: number) => {
                    if (day.activities) {
                      if (day.activities.length === 0) return day;
                      const activities = await Promise.all(
                        day.activities.map(async (activity) => {
                          if (activity === null) return null;
                          const newActivity = await getActivity(activity, true);
                          return newActivity;
                        })
                      );
                      const filteredActivities = activities.filter(
                        (activity) => activity !== null
                      );
                      return { ...day, activities: filteredActivities };
                    } else {
                      return day;
                    }
                  })
                );
                console.log("newTrip", newTrip);
                setTrip(newTrip as Day[]);
              } catch (error) {
                console.error(error);
              }
              // const filteredDayTrip = newTrip.filter((day) => day !== null);
              // const filteredTrip = filteredDayTrip.map((day) => {
              //   if (day.activities) {
              //     const filteredActivities = day.activities.filter(
              //       (activity: any) => activity !== null
              //     );
              //     return { ...day, activities: filteredActivities };
              //   } else {
              //     return day;
              //   }
              // });
              // console.log("filteredTrip", filteredTrip);
              // setTrip(filteredTrip as Day[]);
            }
            getTrip();
          }
        } else {
          await supabaseClient(getToken).then(async (supabase) => {
            const routeValidationText = await getRouteValidationText(getToken);
            console.log("Route validation text", routeValidationText);
            const randomRouteValidationText =
              routeValidationText[
                Math.floor(Math.random() * routeValidationText.length)
              ];
            console.log(
              "Random route validation text",
              randomRouteValidationText
            );
            setTripMetadata({
              id: id as string,
              status: "new",
              name: "Nouveau voyage",
              routeValidationText: randomRouteValidationText,
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
                route_validation_text: randomRouteValidationText,
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
