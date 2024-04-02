import { View, Text } from "react-native";
import React, { useEffect } from "react";
import { useTrip } from "@/context/tripContext";
import { favel } from "@/lib/favelApi";
import { useLocalSearchParams } from "expo-router";
import TripBottomSheet from "./TripBottomSheet";
import Loading from "./(loading)/Loading";
import TripChatWrapper from "./(chat)/TripChatWrapper";

export default function Trip() {
  const { trip, tripMetadata } = useTrip();

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
  }, [trip, tripMetadata?.status]);

  return (
    <>
      {tripMetadata && tripMetadata.status === "trip.loading" && <Loading />}
      <TripBottomSheet />
      <TripChatWrapper />
    </>
  );
}
