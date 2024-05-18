import { MMKV } from "@/app/_layout";
import { View } from "@/components/Themed";
import UserCard from "@/components/UserCard";
import { padding } from "@/constants/values";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList } from "react-native-gesture-handler";

export default function followers() {
  const { id } = useLocalSearchParams();

  const [travelers, setTravelers] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cachedTrip = MMKV.getString(`trip-metadata-${id}`);

    if (cachedTrip) {
      const trip = JSON.parse(cachedTrip);
      const trav = [...trip.invited_ids, trip.author_id];
      setTravelers(trav);
    } else {
      setLoading(false);
      setError("Une erreur est survenue");
    }
  }, []);

  return (
    <View
      style={{
        flex: 1,
        padding: padding,
      }}
    >
      {travelers && travelers.length > 0 ? (
        <FlatList
          data={travelers}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <UserCard
              userId={item}
              followButton
            />
          )}
          contentContainerStyle={{
            rowGap: 10,
          }}
        />
      ) : null}
    </View>
  );
}
