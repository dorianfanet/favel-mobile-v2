import { View, StyleSheet } from "react-native";
import React, { useEffect } from "react";
import { TextInput } from "react-native-gesture-handler";
import { useNewTripChat } from "@/context/newTripChatContext";
import { BottomSheetTextInput, TouchableOpacity } from "@gorhom/bottom-sheet";
import Colors from "@/constants/Colors";
import Icon from "@/components/Icon";
import { useLocalSearchParams } from "expo-router";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import BottomSheet from "@gorhom/bottom-sheet/src/components/bottomSheet";
import { useNewTripForm } from "@/context/newTrip";
import { favel } from "@/lib/favelApi";
import ValidateRouteButton from "./ValidateRouteButton";
import { borderRadius } from "@/constants/values";
import { useTrip } from "@/context/tripContext";
import { Text } from "@/components/Themed";

export default function MessageInput() {
  const { messages, setMessages } = useNewTripChat();

  const [disabled, setDisabled] = React.useState(false);

  useEffect(() => {
    if (messages.length > 0) {
      if (messages[messages.length - 1].status === "running") {
        setDisabled(true);
      } else {
        setDisabled(false);
      }
    }
  }, [messages]);

  const { form } = useNewTripForm();

  const [inputValue, setInputValue] = React.useState("");

  const { rest } = useLocalSearchParams();

  const id = rest[0];

  return (
    <View
      style={{
        paddingHorizontal: 20,
      }}
    >
      <View
        style={{
          flex: 1,
        }}
      >
        {messages.length > 0 &&
        messages[messages.length - 1].status === "finished" &&
        messages[messages.length - 1].route ? (
          <ValidateRouteButton />
        ) : null}
      </View>
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
              Chargement...
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
          />
        )}
        <TouchableOpacity
          onPress={() => {
            const messageId = uuidv4();
            const tempMessages = [...messages];
            tempMessages.push({
              id: tempMessages.length.toString(),
              content: inputValue,
              role: "user",
            });
            favel.sendNewRouteChatMessage(tempMessages, id, messageId, form);
            tempMessages.push({
              id: messageId,
              role: "assistant",
              content: "",
              status: "running",
            });
            setMessages(tempMessages);
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
