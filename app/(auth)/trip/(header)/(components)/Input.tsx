import { View, Text, LayoutChangeEvent, TextInput } from "react-native";
import React from "react";
import Colors from "@/constants/Colors";

export default function Input({
  onFocus,
  onBlur,
  onLayout,
  placeholder = "Say something...",
  style,
  value,
  onChangeText,
  autoFocus = false,
  onSubmit,
  background,
}: {
  onFocus: () => void;
  onBlur: () => void;
  onLayout?: (e: LayoutChangeEvent) => void;
  placeholder?: string;
  style?: any;
  value: string;
  onChangeText: (text: string) => void;
  autoFocus?: boolean;
  onSubmit?: () => void;
  background?: string;
}) {
  const [height, setHeight] = React.useState(20.5);

  return (
    <View
      style={[
        {
          paddingHorizontal: 8,
          backgroundColor: background || "transparent",
          borderRadius: 8,
        },
        style,
      ]}
    >
      <TextInput
        style={[
          {
            color: Colors.light.primary,
            fontFamily: "Outfit_500Medium",
            fontSize: 16,
            borderWidth: 0,
            flex: 1,
            height: height + 10.5,
            marginVertical: 2,
            paddingVertical: 0,
            marginHorizontal: 0,
            lineHeight: 20.5,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor="#083e4f7b"
        onFocus={onFocus}
        onBlur={onBlur}
        onLayout={onLayout}
        onContentSizeChange={(e) => {
          setHeight(e.nativeEvent.contentSize.height);
        }}
        value={value}
        onChangeText={onChangeText}
        autoFocus={autoFocus}
        selectionColor="#093947d1"
        returnKeyType="send"
        onSubmitEditing={onSubmit}
        multiline
        blurOnSubmit
      />
    </View>
  );
}
