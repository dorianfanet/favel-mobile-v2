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
import { Text } from "@/components/Themed";
import { TripChatMessage } from "@/types/types";
import { MMKV } from "../../_layout";
import { getActivity } from "@/lib/supabase";
import { useUser } from "@clerk/clerk-expo";

const paddingVertical = 10; // Padding top and bottom
const paddingHorizontal = 10;

export default function Input({
  messages,
  setMessages,
  tripId,
  disabled,
  type,
  activityId,
}: {
  messages: TripChatMessage[];
  setMessages: any;
  tripId: string;
  disabled?: boolean;
  type: "trip" | "activity";
  activityId?: string;
}) {
  const [inputValue, setInputValue] = useState("");
  const [height, setHeight] = useState(0);

  const { user } = useUser();

  async function handleInputSend() {
    const userMsgId = uuidv4();
    console.log(messages);
    const tempMessages = [...messages];
    tempMessages.push({
      id: userMsgId,
      content: inputValue,
      role: "user",
      status: null,
    });
    const messageId = uuidv4();
    tempMessages.push({
      id: messageId,
      role: "assistant",
      content: "",
      status: "generating",
    });
    setMessages(tempMessages);
    if (type === "trip") {
      favel.sendTripChatMessage(
        tripId!,
        {
          id: userMsgId,
          content: inputValue,
        },
        messageId
      );
    }
    if (type === "activity" && activityId) {
      const activity = await getActivity({
        id: activityId,
        formattedType: "activity",
      });
      favel.sendActivityChatMessage(
        tripId!,
        {
          id: userMsgId,
          content: inputValue,
        },
        messageId,
        activityId,
        activity?.name!,
        user!.id
      );
    }
    setInputValue("");
  }

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
              minHeight: 40,
              height: height,
              borderRadius: borderRadius,
              backgroundColor: "#19466f",
              paddingTop: paddingVertical,
              paddingBottom: paddingVertical,
              paddingLeft: paddingHorizontal,
              paddingRight: paddingHorizontal,
              flex: 1,
              borderWidth: 1,
              borderColor: "#19466f",
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
            placeholderTextColor={"#ffffffc6"}
            multiline
            onContentSizeChange={(event) => {
              setHeight(
                event.nativeEvent.contentSize.height + paddingVertical * 2
              );
            }}
          />
        )}
        <TouchableOpacity
          onPress={handleInputSend}
          style={{
            backgroundColor: Colors.light.accent, // Button color
            height: 40,
            width: 40,
            borderRadius: borderRadius,
            justifyContent: "center",
            alignItems: "center",
            opacity: disabled ? 0.5 : 1,
          }}
          disabled={disabled}
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
