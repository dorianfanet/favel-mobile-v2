import { View, FlatList, Touchable } from "react-native";
import React, { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import { RefreshControl, TouchableOpacity } from "react-native-gesture-handler";
import { Conversation, UserMetadata } from "@/types/types";
import { Image } from "expo-image";
import Colors from "@/constants/Colors";
import ImageWithFallback from "@/components/ImageWithFallback";
import { Text } from "@/components/Themed";
import { padding } from "@/constants/values";
import { formatDateToRelativeShort, getUserMetadata } from "@/lib/utils";
import { MMKV } from "@/app/_layout";

export default function index() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const { user } = useUser();

  const { getToken } = useAuth();

  async function getConversations() {
    console.log("Getting conversations");
    return supabaseClient(getToken).then(async (supabase) => {
      const { data, error } = await supabase.rpc("get_conversations", {
        req_user_id: user?.id,
      });

      if (error) {
        console.log(error);
      }

      console.log("Conversations: ", data);

      if (data) {
        setConversations(data);
        if (user) {
          MMKV.setString(`conversations-${user.id}`, JSON.stringify(data));
        }
        return;
      } else {
        setConversations([]);
        return;
      }
    });
  }

  useEffect(() => {
    if (user) {
      const conversations = MMKV.getString(`conversations-${user.id}`);
      if (conversations) {
        setConversations(JSON.parse(conversations));
      }
    }
    getConversations();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.light.background,
      }}
    >
      <FlatList
        data={conversations}
        renderItem={({ item }) => <ConversationComponent conversation={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          rowGap: 10,
          paddingVertical: 10,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              getConversations().then(() => setRefreshing(false));
            }}
          />
        }
      />
    </View>
  );
}

function ConversationComponent({
  conversation,
}: {
  conversation: Conversation;
}) {
  const [author, setAuthor] = useState<UserMetadata | null>(null);

  const { getToken } = useAuth();

  useEffect(() => {
    async function fetchAuthor() {
      if (!conversation.last_message_author) return;
      if (conversation.last_message_author === "favel")
        setAuthor({ id: "1", firstName: "Favel" });
      const user = await getUserMetadata(
        conversation.last_message_author,
        undefined,
        getToken
      );
      setAuthor(user);
    }

    fetchAuthor();
  }, [conversation]);

  return (
    <Link
      href={`/(auth)/conversation/${conversation.id}`}
      asChild
    >
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: padding,
          backgroundColor: "white",
          gap: 10,
          marginHorizontal: 10,
          borderRadius: 10,
        }}
      >
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 50,
            overflow: "hidden",
          }}
        >
          <ImageWithFallback
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 10,
            }}
            source={{
              uri: conversation.thumbnail,
            }}
            fallbackSource={require("@/assets/images/no-image.png")}
          />
        </View>
        <View
          style={{
            flex: 1,
            gap: 3,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                color: Colors.light.primary,
                fontSize: 16,
                fontFamily: "Outfit_600SemiBold",
                flexShrink: 1,
              }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {conversation.name}
            </Text>
            {conversation.last_message_timestamp && (
              <Text
                style={{
                  color: Colors.light.primary,
                  fontSize: 14,
                  fontFamily: "Outfit_500Medium",
                  opacity: 0.8,
                }}
              >
                {formatDateToRelativeShort(conversation.last_message_timestamp)}
              </Text>
            )}
          </View>
          <Text
            style={{
              color: Colors.light.primary,
              fontSize: 14,
              fontFamily: "Outfit_400Regular",
              opacity: 0.8,
              flexShrink: 1,
            }}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            <Text
              style={{
                color: Colors.light.primary,
                fontSize: 14,
                fontFamily: "Outfit_500Medium",
              }}
            >
              {author ? `${author.firstName} : ` : ""}
            </Text>
            {conversation.last_message_content}
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
}
