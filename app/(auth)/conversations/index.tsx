import { View, Text, FlatList, Touchable } from "react-native";
import React, { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import { TouchableOpacity } from "react-native-gesture-handler";

export default function index() {
  const [conversations, setConversations] = useState<
    { conversation_id: any }[] | null
  >([]);

  const { user } = useUser();

  const { getToken } = useAuth();

  useEffect(() => {
    supabaseClient(getToken).then(async (supabase) => {
      const { data, error } = await supabase
        .from("conversation_participants")
        .select("conversation_id (*)")
        .eq("user_id", user?.id);

      if (error) {
        console.log(error);
      }

      setConversations(data);
    });
  }, []);

  return (
    <View>
      <FlatList
        data={conversations}
        renderItem={({ item }) => (
          <Link
            href={`/(auth)/conversation/${item.conversation_id.id}`}
            asChild
          >
            <TouchableOpacity>
              <Text>{item.conversation_id.name}</Text>
            </TouchableOpacity>
          </Link>
        )}
        keyExtractor={(item) => item.conversation_id.id}
      />
    </View>
  );
}
