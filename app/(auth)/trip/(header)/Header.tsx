import { View, Text, Platform, StatusBar, Keyboard } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { MotiView } from "moti";
import { useAssistant } from "@/context/assistantContext";
import { SafeAreaView } from "react-native-safe-area-context";
import ContainedButton from "@/components/ContainedButton";
import { padding } from "@/constants/values";
import { BlurView, Button } from "@/components/Themed";
import Colors from "@/constants/Colors";
import HeaderButton from "./(components)/NavButton";
import Main from "./(main)/Main";
import { logRender } from "@/lib/utils";

export default function Header() {
  const {
    assistant,
    canPopAssistant,
    popAssistant,
    pushAssistant,
    clearAssistant,
  } = useAssistant();

  const [inputFocused, setInputFocused] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [contentHeight, setContentHeight] = useState(35);

  const handleLeftButtonPress = useCallback(() => {
    if (inputFocused) {
      Keyboard.dismiss();
      setInputValue("");
      setInputFocused(false);
    } else if (canPopAssistant) {
      popAssistant();
    } else {
      // go back
    }
  }, [popAssistant, canPopAssistant, inputFocused]);

  const handleRightButtonPress = useCallback(() => {
    if (inputFocused) {
      // send message
    } else if (canPopAssistant) {
      clearAssistant();
    } else {
      // open menu
    }
  }, [inputFocused, canPopAssistant, popAssistant]);

  useEffect(() => {
    // set input focus to false when keyboard is dismissed
    const keyboardDidHide = Keyboard.addListener("keyboardDidHide", () => {
      setInputFocused(false);
    });

    return () => {
      keyboardDidHide.remove();
    };
  }, []);

  const handleHeightChange = useCallback((height: number) => {
    setContentHeight(height);
  }, []);

  logRender("Header");

  return (
    <View
      style={{
        flex: 1,
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <SafeAreaView
        style={{
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          top: Platform.OS === "android" ? StatusBar.currentHeight : 0,
          paddingHorizontal: padding,
        }}
      >
        <MotiView
          style={{
            width: "100%",
            opacity: 0,
            // shadowColor: Colors.light.primary,
            // shadowOffset: {
            //   width: 0,
            //   height: 2,
            // },
            // shadowOpacity: 0.1,
            // shadowRadius: 5,
          }}
          from={{
            height: 50,
          }}
          animate={{
            height: contentHeight + 15,
            opacity: 1,
          }}
          transition={{
            type: "timing",
            duration: 200,
            delay: 0,
          }}
        >
          <BlurView
            tint="light"
            style={{
              width: "100%",
              borderRadius: 25,
              backgroundColor: "#f4fbffd4",
              flexDirection: "row",
              justifyContent: "space-between",
              padding: 6.5,
              alignItems: "flex-start",
              borderWidth: 1,
              borderColor: Colors.light.bottomSheetBorder,
              flex: 1,
            }}
          >
            <HeaderButton
              icon={
                assistant.state === "loading"
                  ? "stopIcon"
                  : canPopAssistant || inputFocused
                  ? "chevronLeftIcon"
                  : "logoutIcon"
              }
              rotate={canPopAssistant || inputFocused ? 0 : 180}
              onPress={handleLeftButtonPress}
            />
            <Main
              assistant={assistant}
              onHeightChange={handleHeightChange}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              onInputPositionChange={() => {}}
              value={inputValue}
              onChangeText={(text) => setInputValue(text)}
              onSubmit={() => {}}
            />
            <HeaderButton
              icon={
                inputFocused
                  ? "sendIcon"
                  : canPopAssistant
                  ? "closeIcon"
                  : "menuIcon"
              }
              onPress={handleRightButtonPress}
              right
            />
          </BlurView>
        </MotiView>
        <Button
          title="push loading"
          onPress={() => {
            pushAssistant({
              state: "loading",
              key: `applying-modifications`,
              message: "Loading...",
            });
          }}
        />
        <Button
          title="push simple message"
          onPress={() => {
            pushAssistant({
              state: "speaking",
              key: `simple-message`,
              message: "This is a simple message",
            });
          }}
        />
        <Button
          title="push actions"
          onPress={() => {
            pushAssistant({
              state: "speaking",
              key: `message-with-actions`,
              message: "This is a message with some actions",
              action: {
                type: "list",
                items: [
                  {
                    action: "pop",
                    text: "Action 1",
                  },
                  {
                    action: "pop",
                    text: "Action 2",
                  },
                ],
              },
            });
          }}
        />
        <Button
          title="push actions"
          onPress={() => {
            pushAssistant({
              state: "speaking",
              key: `message-with-actions-2`,
              message: "This is a message with some actions",
              action: {
                type: "list",
                items: [
                  {
                    action: "pop",
                    text: "Action 1",
                  },
                  {
                    action: "pop",
                    text: "Action 2",
                  },
                ],
              },
            });
          }}
        />
      </SafeAreaView>
    </View>
  );
}
