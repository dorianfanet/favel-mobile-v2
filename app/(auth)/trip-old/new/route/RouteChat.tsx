import { View } from "react-native";
import React, { useEffect, useRef } from "react";
import { FlatList } from "react-native-gesture-handler";
import { ChatMessage } from "@/types/types";
import { useLocalSearchParams } from "expo-router";
import { useNewTripChat } from "@/context/newTripChatContext";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { useTrip } from "@/context/tripContext";
import { useNewTripForm } from "@/context/newTrip";
import Message from "./Message";
import ValidateRouteButton from "./ValidateRouteButton";
import { favelClient } from "@/lib/favelApi";
import { useAuth } from "@clerk/clerk-expo";

export default function RouteChat() {
  const { form } = useNewTripForm();

  const { rest } = useLocalSearchParams();

  const id = rest[0];

  const { messages, setMessages, retryMessage } = useNewTripChat();

  const flatListRef = useRef<FlatList>(null);

  const { getToken } = useAuth();

  async function sendFirstMessage(messageId: string) {
    setMessages((currentMessages: ChatMessage[]) => [
      ...currentMessages.slice(1), // assuming you want to keep the rest of the messages
      {
        id: messageId,
        role: "assistant",
        status: "running",
        content: "Je réfléchis à votre itinéraire...",
      },
    ]);
    const firstMessage = await favelClient(getToken).then(async (favel) => {
      return await favel.sendFirstRouteChatMessage(
        `${form.destination}. ${parseInt(form.flexDates.duration!) || 4} jours`,
        id,
        messageId
      );
    });
    console.log("First message: ", firstMessage);
    if ("error" in firstMessage) {
      setMessages((currentMessages: ChatMessage[]) => [
        ...currentMessages.slice(1), // assuming you want to keep the rest of the messages
        {
          id: messageId,
          role: "assistant",
          status: "error",
          content: "Une erreur est survenue. Veuillez réessayer.",
        },
      ]);
    } else {
      console.log("First message sent: ", firstMessage);
      setMessages((currentMessages: ChatMessage[]) => [
        ...currentMessages.slice(1), // assuming you want to keep the rest of the messages
        {
          id: messageId,
          role: "assistant",
          status: "finished",
          content: firstMessage.content,
        },
      ]);
    }
  }

  useEffect(() => {
    if (messages.length > 1) return;
    async function fetchMessages() {
      const messageId = uuidv4();
      sendFirstMessage(messageId);
    }

    fetchMessages();
  }, []);

  return (
    <FlatList
      data={JSON.parse(JSON.stringify(messages)).reverse()}
      ref={flatListRef}
      inverted
      keyExtractor={(item: any, index) => item.id + index.toString()}
      renderItem={({ item, index }) => {
        return item.role !== "system" ? (
          <Message
            key={item.id + index.toString()}
            // key={item.id}
            message={item}
            index={index}
            onRetry={async () => {
              console.log(index);
              if (messages.length > 1) {
                retryMessage(item.id, id, form, messages);
              } else {
                const tempMessage: ChatMessage = {
                  id: item.id,
                  role: "assistant",
                  content: "Je réfléchis à votre itinéraire...",
                  status: "running",
                };
                setMessages([tempMessage]);
                sendFirstMessage(item.id);
              }
            }}
            isLast={index === 0}
          />
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
      ListHeaderComponent={() => (
        <>
          {/* <View> */}
          {messages.length > 0 &&
          messages[messages.length - 1].status === "finished" &&
          messages[messages.length - 1].route ? (
            <ValidateRouteButton />
          ) : null}
          {/* </View> */}
        </>
      )}
    />
  );
}
