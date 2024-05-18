import { Text, View } from "@/components/Themed";
import UserCard from "@/components/UserCard";
import { padding } from "@/constants/values";
import { supabaseClient } from "@/lib/supabaseClient";
import { useAuth } from "@clerk/clerk-expo";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { FlatList } from "react-native-gesture-handler";

export default function followers() {
  const { rest } = useLocalSearchParams();
  const type = rest[0] as "followers" | "following";
  const userId = rest[1] as string;

  const [follows, setFollows] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { getToken } = useAuth();

  async function getFollows() {
    await supabaseClient(getToken).then(async (supabase) => {
      const { data, error } = await supabase
        .from("follows")
        .select("*")
        .eq(type === "followers" ? "following_id" : "follower_id", userId);
      if (error) {
        console.error(error);
        setLoading(false);
        setError("Une erreur est survenue");
        return;
      }

      if (data) {
        if (type === "followers") {
          setFollows(data.map((follow: any) => follow.follower_id));
        } else {
          setFollows(data.map((follow: any) => follow.following_id));
        }
        setLoading(false);
        return;
      }

      setLoading(false);
      setError("Aucun abonné");
    });
  }

  useEffect(() => {
    getFollows();
  }, []);

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <Stack.Screen
        options={{
          title: type === "followers" ? "Abonnés" : "Abonnements",
        }}
      />
      {follows && follows.length > 0 ? (
        <FlatList
          data={follows}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <UserCard
              userId={item}
              followButton
            />
          )}
          style={{
            padding: padding,
          }}
          contentContainerStyle={{
            rowGap: 10,
          }}
        />
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {loading ? (
            <ActivityIndicator size="large" />
          ) : error ? (
            error
          ) : (
            <Text>{`Aucun ${
              type === "followers" ? "abonné" : "abonnement"
            }`}</Text>
          )}
        </View>
      )}
    </View>
  );
}
