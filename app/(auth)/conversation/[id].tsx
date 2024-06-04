import { View, Text } from "react-native";
import React from "react";
import { ConversationProvider } from "@/context/conversationContext";
import ConversationComponent from "./Conversation";

export default function Index() {
  return (
    // <View>
    //   <Text>Conversation</Text>
    // </View>
    <ConversationProvider>
      <ConversationComponent />
    </ConversationProvider>
  );
}
