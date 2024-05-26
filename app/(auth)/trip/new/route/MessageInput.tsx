import { View, StyleSheet } from "react-native";
import React, { useEffect } from "react";
import { useNewTripChat } from "@/context/newTripChatContext";
import { BottomSheetTextInput, TouchableOpacity } from "@gorhom/bottom-sheet";
import Colors from "@/constants/Colors";
import Icon from "@/components/Icon";
import { useLocalSearchParams } from "expo-router";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { useNewTripForm } from "@/context/newTrip";
import { borderRadius } from "@/constants/values";
import { Text } from "@/components/Themed";
import { useAuth } from "@clerk/clerk-expo";
import { supabaseClient } from "@/lib/supabaseClient";
import { favelClient } from "@/lib/favelApi";
import { useTrip } from "@/context/tripContext";
import { TripMetadata } from "@/types/types";

export default function MessageInput() {
  const { messages, setMessages } = useNewTripChat();
  const { setTripMetadata } = useTrip();

  const [disabled, setDisabled] = React.useState(false);

  const { id } = useLocalSearchParams();

  useEffect(() => {
    if (messages.length > 0) {
      if (messages[messages.length - 1].status === "finished") {
        setDisabled(false);
      } else {
        setDisabled(true);
      }
    }
  }, [messages]);

  const { form } = useNewTripForm();

  const [inputValue, setInputValue] = React.useState("");

  const { getToken } = useAuth();

  return (
    <View
      style={{
        paddingHorizontal: 20,
      }}
    >
      <View style={styles.footerContainer}>
        {disabled ? (
          <View
            style={{
              height: 40,
              borderRadius: borderRadius,
              backgroundColor: "#19466f",
              padding: 10,
              flex: 1,
            }}
          >
            <Text
              style={{
                color: "white",
                opacity: 0.5,
              }}
            >
              {messages[messages.length - 1].status === "running"
                ? "Chargement..."
                : "Erreur"}
            </Text>
          </View>
        ) : (
          <BottomSheetTextInput
            style={{
              height: 40,
              borderRadius: borderRadius,
              backgroundColor: "#0e3355",
              paddingHorizontal: 10,
              paddingVertical: 10,
              color: "white",
              flex: 1,
              borderWidth: 1,
              borderColor: "#19466f",
            }}
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="Votre message..."
            placeholderTextColor={"#ffffff71"}
          />
        )}
        <TouchableOpacity
          onPress={async () => {
            const userMessageId = uuidv4();
            const messageId = uuidv4();

            const tempMessages = [...messages];
            tempMessages.push({
              id: userMessageId,
              content: inputValue,
              role: "user",
            });
            supabaseClient(getToken).then(async (supabase) => {
              supabase.from("new_trip_chat").insert([
                {
                  id: userMessageId,
                  content: inputValue,
                  role: "user",
                  trip_id: id,
                },
              ]);
            });
            tempMessages.push({
              id: messageId,
              role: "assistant",
              content: "Je réfléchis à votre itinéraire...",
              status: "running",
            });
            setMessages(tempMessages);

            const newMessage = await favelClient(getToken).then(
              async (favel) => {
                return await favel.sendNewRouteChatMessage(
                  tempMessages,
                  id as string,
                  messageId,
                  form
                );
              }
            );

            console.log("Temp messages: ", tempMessages);
            console.log("New message: ", newMessage);

            if (
              "error" in newMessage ||
              (newMessage.route && newMessage.route.length === 0)
            ) {
              setMessages([
                ...tempMessages.slice(0, tempMessages.length - 1),
                {
                  id: messageId,
                  role: "assistant",
                  status: "error",
                  content: "Une erreur est survenue. Veuillez réessayer.",
                },
              ]);
            } else {
              console.log("First message sent: ", newMessage);
              setMessages([
                ...tempMessages.slice(0, tempMessages.length - 1),
                {
                  id: messageId,
                  role: "assistant",
                  status: "finished",
                  content: newMessage.content,
                  route: newMessage.route,
                },
              ]);
              if (newMessage.route) {
                setTripMetadata((tripMetadata) => {
                  return {
                    ...(tripMetadata as TripMetadata),
                    route: newMessage.route,
                  };
                });
              }
            }

            setInputValue("");
          }}
          disabled={disabled}
          style={{
            backgroundColor: Colors.light.accent, // Button color
            height: 40,
            width: 40,
            borderRadius: borderRadius,
            justifyContent: "center",
            alignItems: "center",
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <Icon
            icon="sendIcon"
            size={20}
            color="white"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
});
