import { View, Text, Pressable } from "react-native";
import React, { useCallback, useEffect, useRef } from "react";
import TripChat from "./TripChat";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { padding } from "@/constants/values";
import Colors from "@/constants/Colors";
import Icon from "@/components/Icon";
import { supabase } from "@/lib/supabase";
import { useTrip } from "@/context/tripContext";
import { TripChatProvider } from "@/context/tripChat";

export default function TripChatWrapper() {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  return (
    <>
      <Pressable
        onPress={handlePresentModalPress}
        style={{
          position: "absolute",
          bottom: padding * 1.5,
          right: padding * 1.5,
          backgroundColor: Colors.light.accent,
          width: 55,
          height: 55,
          borderRadius: 18,
          shadowColor: Colors.light.accent,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.5,
          shadowRadius: 12,
          elevation: 8,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Icon
          icon={"penIcon"}
          color={"#fff"}
          size={26}
        />
      </Pressable>
      <TripChatProvider>
        <TripChat bottomSheetModalRef={bottomSheetModalRef} />
      </TripChatProvider>
    </>
  );
}
