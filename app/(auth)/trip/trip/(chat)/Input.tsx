import { View, StyleSheet } from "react-native";
import React, { useState } from "react";
import { BottomSheetTextInput, TouchableOpacity } from "@gorhom/bottom-sheet";
import Colors from "@/constants/Colors";
import Icon from "@/components/Icon";
import { useLocalSearchParams } from "expo-router";
import "react-native-get-random-values";
import { borderRadius } from "@/constants/values";
import { v4 as uuidv4 } from "uuid";
import { useTripChat } from "@/context/tripChat";
import { favel } from "@/lib/favelApi";

const paddingVertical = 10; // Padding top and bottom
const paddingHorizontal = 10;

export default function Input({
  messages,
  setMessages,
  tripId,
}: {
  messages: any[];
  setMessages: any;
  tripId: string;
}) {
  const [inputValue, setInputValue] = useState("");
  const [height, setHeight] = useState(0);

  async function handleInputSend() {
    const userMsgId = uuidv4();
    console.log(messages);
    const tempMessages = [...messages];
    tempMessages.push({
      id: userMsgId,
      content: inputValue,
      role: "user",
    });
    const messageId = uuidv4();
    tempMessages.push({
      id: messageId,
      role: "assistant",
      content: "",
    });
    setMessages(tempMessages);
    favel.sendTripChatMessage(
      tripId!,
      {
        id: userMsgId,
        content: inputValue,
      },
      messageId
    );
    setInputValue("");
  }

  return (
    <View
      style={{
        paddingHorizontal: 20,
      }}
    >
      <View style={styles.footerContainer}>
        <BottomSheetTextInput
          style={{
            minHeight: 40,
            // maxHeight: 200,
            height: height,
            borderRadius: borderRadius,
            backgroundColor: Colors.dark.secondary,
            paddingTop: paddingVertical,
            paddingBottom: paddingVertical,
            paddingLeft: paddingHorizontal,
            paddingRight: paddingHorizontal,
            color: "white",
            flex: 1,
            borderWidth: 1,
            borderColor: "#19466f",
          }}
          value={inputValue}
          onChangeText={setInputValue}
          placeholder="Votre message..."
          multiline
          onContentSizeChange={(event) => {
            setHeight(
              event.nativeEvent.contentSize.height + paddingVertical * 2
            );
          }}
        />
        <TouchableOpacity
          onPress={handleInputSend}
          style={{
            backgroundColor: Colors.light.accent, // Button color
            height: 40,
            width: 40,
            borderRadius: borderRadius,
            justifyContent: "center",
            alignItems: "center",
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
