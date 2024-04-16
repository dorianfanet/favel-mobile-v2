import { View, Text } from "react-native";
import React, { useEffect } from "react";
import { useTrip } from "@/context/tripContext";
import { NewTripFormProvider } from "@/context/newTrip";
import Form from "./Form";
import Route from "./route/Route";
import { NewTripChatProvider } from "@/context/newTripChatContext";
import { track } from "@amplitude/analytics-react-native";

export default function New() {
  const { tripMetadata } = useTrip();

  console.log(tripMetadata);

  useEffect(() => {
    track("New trip page viewed");
  }, []);

  return (
    <NewTripFormProvider>
      <>
        <Form />
        <NewTripChatProvider>
          <Route />
        </NewTripChatProvider>
      </>
    </NewTripFormProvider>
  );
}
