import { View, Text } from "react-native";
import React from "react";
import { AnimatePresence, MotiView } from "moti";
import { Assistant } from "@/context/assistantContext";
import Input from "../(components)/Input";
import Loading from "./Loading";
import { logRender } from "@/lib/utils";
import Speaking from "./Speaking";

export default function Main({
  assistant,
  onHeightChange,
  onFocus,
  onBlur,
  onInputPositionChange,
  value,
  onChangeText,
  onSubmit,
}: {
  assistant: Assistant;
  onHeightChange: (height: number) => void;
  onFocus: () => void;
  onBlur: () => void;
  onInputPositionChange: (y: number) => void;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
}) {
  logRender("Main");

  return (
    <AnimatePresence>
      <MotiView
        exit={{
          opacity: 0,
          translateY: -10,
        }}
        animate={{
          opacity: 1,
          translateY: 0,
        }}
        from={{
          opacity: 0,
          translateY: 15,
        }}
        transition={{
          type: "timing",
          duration: 200,
          delay: 0,
        }}
        exitTransition={{
          type: "timing",
          duration: 200,
          delay: 0,
        }}
        style={{
          flex: 1,
          position: "absolute",
          top: 6.5,
          left: 41.5,
          right: 41.5,
        }}
        onLayout={(e) => {
          onHeightChange(e.nativeEvent.layout.height);
        }}
        key={assistant.key}
      >
        {assistant.state === "default" ? (
          <Input
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder={assistant.placeholder}
            onLayout={(e) => onInputPositionChange(e.nativeEvent.layout.y)}
            value={value}
            onChangeText={onChangeText}
            onSubmit={onSubmit}
          />
        ) : null}
        {assistant.state === "loading" ? (
          <Loading assistant={assistant} />
        ) : null}
        {assistant.state === "speaking" ? (
          <Speaking
            assistant={assistant}
            onFocus={onFocus}
            onBlur={onBlur}
            onLayout={(e) => onInputPositionChange(e.nativeEvent.layout.y)}
            value={value}
            onChangeText={onChangeText}
            onSubmit={onSubmit}
          />
        ) : null}
      </MotiView>
    </AnimatePresence>
  );
}
