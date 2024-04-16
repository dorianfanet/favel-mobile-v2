import { View, Touchable, TouchableOpacity } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useTrip } from "@/context/tripContext";
import { Text } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { padding } from "@/constants/values";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";

export default function LoadingStuckButton() {
  const { tripMetadata, trip } = useTrip();
  const lastTripUpdateTimestamp = useRef(new Date());
  const [isStuck, setIsStuck] = useState(false);

  const router = useRouter();

  useEffect(() => {
    lastTripUpdateTimestamp.current = new Date();
  }, [trip]);

  useEffect(() => {
    if (tripMetadata && tripMetadata.status.includes("loading")) {
      const interval = setInterval(() => {
        if (
          new Date().getTime() - lastTripUpdateTimestamp.current.getTime() >
          20000
        ) {
          console.log("stuck");
          setIsStuck(true);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [tripMetadata]);

  return isStuck ? (
    <TouchableOpacity
      style={{
        position: "absolute",
        top: 130,
        left: padding,
        right: padding,
        backgroundColor: Colors.light.accent,
        padding: padding,
        paddingVertical: padding / 2,
        borderRadius: 10,
      }}
      onPress={async () => {
        const { error } = await supabase
          .from("trips_v2")
          .update({ trip: null, status: "trip.init" })
          .eq("id", tripMetadata?.id);

        try {
          router.navigate(`/(auth)/trip/${tripMetadata?.id}/new`);
        } catch (error) {
          console.error(error);
        }
      }}
    >
      <Text
        style={{
          color: "white",
          fontFamily: "Outfit_600SemiBold",
          fontSize: 14,
          textAlign: "center",
        }}
      >
        Oupss... Le chargement semble bloqué, appuyez ici pour le relancer
      </Text>
    </TouchableOpacity>
  ) : null;
}
