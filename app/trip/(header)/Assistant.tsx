import { View, Text, Platform, StatusBar, Keyboard } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { MotiView } from "moti";
import { useAssistant } from "@/context/assistantContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { padding } from "@/constants/values";
import { Button } from "@/components/Themed";
import Colors from "@/constants/Colors";
import HeaderButton from "./(components)/NavButton";
import Main from "./(main)/Main";

export default function Assistant() {
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

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 5,
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
        <View
          style={{
            width: "100%",
            borderRadius: 25,
            flexDirection: "row",
            justifyContent: "space-between",
            padding: 6.5,
            alignItems: "flex-start",
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
        </View>
      </MotiView>
    </View>
  );
}
