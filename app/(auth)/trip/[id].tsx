import { View, Text, ActivityIndicator } from "react-native";
import React, { useEffect } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useTrip } from "@/context/tripContext";
import Colors from "@/constants/Colors";
import { supabase } from "@/lib/supabase";
import { TripMetadata } from "@/types/types";
import { useUser } from "@clerk/clerk-expo";
import { BlurView } from "@/components/Themed";

export default function Index() {
  const { id } = useLocalSearchParams();
  const { user } = useUser();

  const { setTripMetadata, setTrip } = useTrip();

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
        .select("id, trip, status, preferences, route, status_message, prompt")
        .eq("id", id)
        .single();
      if (data) {
        setTripMetadata(data as TripMetadata);
        if (data.trip) {
          setTrip(data.trip);
        }
        router.navigate(`/(auth)/trip/${id}/trip`);
      } else {
        await createTrip();
      }
    }

    checkForTrip();
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
        <Text
          style={{
            color: "white",
            fontSize: 12,
            fontFamily: "Outfit_500Medium",
            textAlign: "center",
            marginTop: 10,
          }}
        >
          ID: {id}
        </Text>
      </BlurView>
    </View>
  );
}
