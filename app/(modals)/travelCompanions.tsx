import React, { useEffect, useState } from "react";
import { View as ThemedView, Text, Button } from "@/components/Themed";
import ContainedButton from "@/components/ContainedButton";
import { useUser } from "@clerk/clerk-expo";
import UserCard from "@/components/UserCard";
import { FlatList } from "react-native-gesture-handler";
import { padding } from "@/constants/values";

export default function travelCompanions() {
  const { user } = useUser();

  const [coTravelers, setCoTravelers] = useState<string[] | null>(null);

  useEffect(() => {
    if (user && user.publicMetadata && user.publicMetadata.coTravelers) {
      setCoTravelers(user.publicMetadata.coTravelers as string[]);
    }
  }, [user]);

  return (
    <ThemedView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: padding,
        paddingTop: 80,
      }}
    >
      {coTravelers && coTravelers.length > 0 ? (
        <FlatList
          data={coTravelers}
          keyExtractor={(item) => item}
          renderItem={({ item }) => <UserCard userId={item} />}
          style={{
            width: "100%",
          }}
        />
      ) : (
        <>
          <Text
            style={{
              fontSize: 24,
              fontFamily: "Outfit_600SemiBold",
              textAlign: "center",
            }}
          >
            Vous n'avez pas encore de covoyageurs...
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Outfit_500Medium",
              textAlign: "center",
              marginVertical: 20,
            }}
          >
            Invitez vos proches à rejoindre vos voyages pour les planifier
            ensemble !
          </Text>
          <ContainedButton
            title="Inviter des amis"
            onPress={() => {}}
          />
        </>
      )}
    </ThemedView>
  );
}
