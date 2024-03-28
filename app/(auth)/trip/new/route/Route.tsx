import { View, StyleSheet } from "react-native";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import BottomSheet, { BottomSheetFooter } from "@gorhom/bottom-sheet";
import { useTrip } from "@/context/tripContext";
import { BlurView } from "@/components/Themed";
import MessageInput from "./MessageInput";
import RouteChat from "./RouteChat";

export default function Route() {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ["45%"], []);

  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  const { tripMetadata } = useTrip();

  useEffect(() => {
    if (tripMetadata?.status === "new.route") {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [tripMetadata?.status]);

  const renderFooter = useCallback(
    (props: any) => (
      <BottomSheetFooter
        {...props}
        bottomInset={24}
      >
        <MessageInput />
      </BottomSheetFooter>
    ),
    []
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backgroundComponent={(props) => (
        <View
          style={{
            flex: 1,
            padding: 0,
            margin: 0,
          }}
          {...props}
        >
          <BlurView />
        </View>
      )}
      handleIndicatorStyle={{
        backgroundColor: "white",
      }}
      footerComponent={renderFooter}
      keyboardBlurBehavior="restore"
    >
      <View
        style={{
          flex: 1,
        }}
      >
        <View
          style={{
            flex: 1,
          }}
        >
          {tripMetadata?.status === "new.route" ? <RouteChat /> : null}
        </View>
        <View
          style={{
            height: 84,
          }}
        ></View>
      </View>
    </BottomSheet>
  );
}
