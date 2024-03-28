import { View, Text } from "react-native";
import React from "react";
import { useTrip } from "@/context/tripContext";
import { NewTripFormProvider } from "@/context/newTrip";
import Form from "./Form";
import Route from "./route/Route";
import { NewTripChatProvider } from "@/context/newTripChatContext";

export default function New() {
  const { tripMetadata } = useTrip();

  console.log(tripMetadata);

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
