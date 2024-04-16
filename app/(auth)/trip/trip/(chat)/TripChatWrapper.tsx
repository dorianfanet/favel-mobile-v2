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

export default function TripChatWrapper({
  children,
  type,
  activityId,
}: {
  children: React.ReactNode;
  type: "trip" | "activity";
  activityId?: string;
}) {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const clonedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        onPress: handlePresentModalPress,
      } as typeof child.props);
    }
    return child;
  });

  return (
    <>
      {clonedChildren}
      <TripChatProvider>
        <TripChat
          bottomSheetModalRef={bottomSheetModalRef}
          type={type}
          activityId={activityId}
        />
      </TripChatProvider>
    </>
  );
}
