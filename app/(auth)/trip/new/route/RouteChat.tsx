import { View, Text, Button, Pressable, TouchableOpacity } from "react-native";
import React, { RefObject, useEffect, useRef } from "react";
import { FlatList } from "react-native-gesture-handler";
import { getDaysDiff } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { ChatMessage, TripMetadata } from "@/types/types";
import { useLocalSearchParams } from "expo-router";
import { useNewTripChat } from "@/context/newTripChatContext";
import Markdown from "react-native-markdown-display";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { useTrip } from "@/context/tripContext";
import {
  BottomSheetFlatListMethods,
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import { useNewTripForm } from "@/context/newTrip";
import { favel } from "@/lib/favelApi";
import { months } from "@/constants/data";

export default function RouteChat() {
  const { form } = useNewTripForm();
  const { setTripMetadata, destinationData } = useTrip();

  const routeBufferRef = useRef<any>({});

  const { rest } = useLocalSearchParams();

  const id = rest[0];

  const { messages, setMessages } = useNewTripChat();

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 1) return;
    async function fetchMessages() {
      const { data, error } = await supabase
        .from("new_trip_chat")
        .select("id, role, content, route, status")
        .eq("trip_id", id);

      if (error) {
        console.error("Error fetching messages: ", error);
        return;
      }
      if (data.length > 0) {
        setMessages([...messages, ...data]);
      } else {
        const messageId = uuidv4();
        setMessages([
          {
            id: messageId,
            role: "assistant",
            content: "Je réfléchis à votre itinéraire...",
          },
        ]);
        if (
          destinationData!.result === "destination" ||
          destinationData!.result === "unknown"
        ) {
          favel.sendFirstRouteChatMessage(
            `${form.destination}. ${
              parseInt(form.flexDates.duration!) || 4
            } jours`,
            id,
            messageId
          );
        } else if (destinationData!.result === "route") {
          favel.sendNewRouteChatMessage([], id, messageId, form);
        }
      }
    }

    fetchMessages();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel(`${id}-chat`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "new_trip_chat",
          filter: `trip_id=eq.${id}`,
        },
        (payload) => {
          if (payload.new) {
            console.log("New message: ", payload.new);
            // @ts-ignore
            setMessages((currentMessages: ChatMessage[]) => {
              const assistantMessage = currentMessages.findIndex(
                (message) => message.id === payload.new.id
              );
              if (assistantMessage !== -1) {
                currentMessages[assistantMessage] = payload.new as ChatMessage;
                return currentMessages;
              }
              return currentMessages;
            });
            if (
              payload.new.route &&
              JSON.stringify(payload.new.route) !== routeBufferRef.current
            ) {
              console.log("Route changed: ", payload.new.route);
              routeBufferRef.current = JSON.stringify(payload.new.route);
              setTripMetadata((currentMetadata) => {
                return {
                  ...(currentMetadata as TripMetadata),
                  route: payload.new.route,
                };
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  console.log("messages", messages);

  return (
    <FlatList
      data={JSON.parse(JSON.stringify(messages)).reverse()}
      ref={flatListRef}
      inverted
      keyExtractor={(item: any, index) => item.id + index.toString()}
      renderItem={({ item, index }) => {
        return item.role !== "system" ? (
          <View
            style={{
              padding: 20,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Outfit_600SemiBold",
                color: "white",
                marginBottom: 10,
              }}
            >
              {item.role === "assistant" ? "Favel" : "Vous"}
            </Text>
            <Markdown
              style={{
                body: {
                  fontSize: 16,
                  fontFamily: "Outfit_400Regular",
                  color: "white",
                },
                strong: {
                  fontSize: 18,
                  fontFamily: "Outfit_700Bold",
                  color: "white",
                },
              }}
            >
              {item.content}
            </Markdown>
          </View>
        ) : null;
      }}
      ItemSeparatorComponent={() => (
        <View
          style={{
            height: 2,
            backgroundColor: "#ffffff",
            opacity: 0.2,
            width: "100%",
          }}
        />
      )}
      contentContainerStyle={{
        paddingBottom:
          messages.length > 0 &&
          messages[messages.length - 1].status === "finished"
            ? 80
            : 0,
      }}
    />
  );
}
