import React from "react";
import { View as ThemedView, Text, Button } from "@/components/Themed";
import ContainedButton from "@/components/ContainedButton";

export default function travelCompanions() {
  return (
    <ThemedView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontFamily: "Outfit_600SemiBold",
          textAlign: "center",
        }}
      >
        Vous n'avez pas encore de compagnons de voyage...
      </Text>
      <Text
        style={{
          fontSize: 16,
          fontFamily: "Outfit_500Medium",
          textAlign: "center",
          marginVertical: 20,
        }}
      >
        Invitez vos proches à rejoindre vos voyages pour les partager avec eux !
      </Text>
      <ContainedButton
        title="Inviter des amis"
        onPress={() => {}}
      />
    </ThemedView>
  );
}
