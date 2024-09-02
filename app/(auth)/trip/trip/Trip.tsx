import { View, Text } from "react-native";
import React, { useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { createClient } from "@supabase/supabase-js";
import { Day, TripEdit, TripMetadata } from "@/types/types";
import { getActivity } from "@/lib/supabase";
import Toast from "react-native-toast-message";
import { useTrip } from "@/context/tripContext";
import TripBottomSheet from "./TripBottomSheet";
import ActivityModal from "./ActivityModal";
import Loading from "./loading/Loading";
import { supabaseClient } from "@/lib/supabaseClient";
import { useAssistant } from "@/context/assistantContext";

export default function Trip({ id }: { id: string }) {
  const { setTripMetadata, setTrip, setTripEdits, tripMetadata } = useTrip();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [token, setToken] = React.useState<string | null>(null);

  useEffect(() => {
    if (token) return;
    async function init() {
      const token = await getToken();
      setToken(token);
    }
    init();
  }, []);

  useEffect(() => {
    if (!token) return;

    const supabase = createClient(
      process.env.EXPO_PUBLIC_SUPABASE_URL!,
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

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
                try {
                  const newTrip = await Promise.all(
                    payload.new.trip.map(async (day: Day, index: number) => {
                      if (day.activities) {
                        if (day.activities.length === 0) return day;
                        const activities = await Promise.all(
                          day.activities.map(async (activity) => {
                            // if (activity.route) {
                            //   return activity;
                            // } else {
                            if (activity === null) return null;
                            const newActivity = await getActivity(activity);
                            return newActivity;
                            // }
                          })
                        );
                        return { ...day, activities };
                      } else {
                        return day;
                      }
                    })
                  );
                  console.log(newTrip as Day[]);
                  // remove all potential null activities

                  setTrip(newTrip as Day[]);
                  // const newTrip = await Promise.all(
                  //   data!.trip.map(async (day: Day, index: number) => {
                  //     if (day.activities) {
                  //       if (day.activities.length === 0) return day;
                  //       const activities = await Promise.all(
                  //         day.activities.map(async (activity) => {
                  //           if (activity === null) return null;
                  //           const newActivity = await getActivity(activity, true);
                  //           return newActivity;
                  //         })
                  //       );
                  //       const filteredActivities = activities.filter(
                  //         (activity) => activity !== null
                  //       );
                  //       return { ...day, activities: filteredActivities };
                  //     } else {
                  //       return day;
                  //     }
                  //   })
                  // );
                  // console.log("newTrip", newTrip);
                  // setTrip(newTrip as Day[]);
                } catch (error) {
                  console.error(error);
                }
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
  }, [id, token]);

  useEffect(() => {
    const interval = setInterval(async () => {
      supabaseClient(getToken).then(async (supabase) => {
        if (!user) return;
        const { error } = await supabase.from("user_activity").upsert([
          {
            id: `${id}-${user.id}`,
            last_activity: new Date(),
            trip_id: id,
            user_id: user.id,
          },
        ]);
        if (error) {
          console.log(error);
        }
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {tripMetadata ? (
        <>
          {/* {tripMetadata.status === "trip.loading" && <Loading />} */}
          {tripMetadata.status === "trip" && (
            <>
              <TripBottomSheet />
              <ActivityModal />
            </>
          )}
        </>
      ) : null}
    </>
  );
}
