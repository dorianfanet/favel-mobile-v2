import { View, Text, LayoutChangeEvent } from "react-native";
import React from "react";
import Colors from "@/constants/Colors";
import { Assistant } from "@/context/assistantContext";
import Input from "../(components)/Input";
import Action from "../(components)/(action)/Action";
import { logRender } from "@/lib/utils";

export default function Speaking({
  assistant,
  onFocus,
  onBlur,
  onLayout,
  value,
  onChangeText,
  onSubmit,
}: {
  assistant: Assistant;
  onFocus: () => void;
  onBlur: () => void;
  onLayout?: (e: LayoutChangeEvent) => void;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
}) {
  logRender("Speaking");

  return assistant.state === "speaking" ? (
    <View
      style={{
        paddingTop: 7.5,
        paddingBottom: 7.5,
        flex: 1,
      }}
    >
      <Text
        style={{
          color: Colors.light.primary,
          fontFamily: "Outfit_500Medium",
          fontSize: 16,
          width: "100%",
          marginHorizontal: 8,
        }}
        numberOfLines={3}
      >
        {assistant.message}{" "}
      </Text>
      {assistant.action ? (
        <Action
          action={assistant.action}
          // onResponse={(response, customConversation, avoidConversationUpdate) =>
          //   handleSendMessage(
          //     response,
          //     customConversation,
          //     avoidConversationUpdate
          //   )
          // }
          // onInputFocus={() => setInputFocused(true)}
          // onInputBlur={() => setInputFocused(false)}
          // onInputLayout={(e) => {
          //   console.log(e.nativeEvent.layout.y);
          //   followUpInputPosition.current = e.nativeEvent.layout.y;
          // }}
          // inputValue={inputValue}
          // onInputChangeText={(text) => setInputValue(text)}
          // modificationsModalRef={modificationsModalRef}
        />
      ) : null}
      {assistant.followUp &&
      !(assistant.action?.type === "list" && assistant.action.checkbox) ? (
        <Input
          onFocus={onFocus}
          onBlur={onBlur}
          style={{
            marginTop: 8,
          }}
          onLayout={onLayout}
          value={value}
          onChangeText={onChangeText}
          autoFocus={assistant.followUp.autoFocus}
          placeholder={assistant.followUp.placeholder}
          onSubmit={onSubmit}
          background="rgba(8, 62, 79, 0.05)"
        />
      ) : null}
    </View>
  ) : null;
}
