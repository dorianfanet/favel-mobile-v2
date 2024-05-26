import { View, StyleSheet, ActivityIndicator } from "react-native";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import BottomSheet, { BottomSheetFooter } from "@gorhom/bottom-sheet";
import { useTrip } from "@/context/tripContext";
import { BlurView } from "@/components/Themed";
import MessageInput from "./MessageInput";
import RouteChat from "./RouteChat";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function Route() {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ["55%"], []);

  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  const { tripMetadata, destinationData } = useTrip();

  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    if (tripMetadata?.status === "new.route" && destinationData) {
      bottomSheetRef.current?.expand();
      setLoading(false);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [tripMetadata?.status, destinationData]);

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
    <>
      {loading && tripMetadata?.status === "new.route" && (
        <View
          style={{
            position: "absolute",
            bottom: 100,
            width: "100%",
            justifyContent: "center",
          }}
        >
          <View>
            <ActivityIndicator
              size="large"
              color={"#fff"}
            />
          </View>
        </View>
      )}
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
            {!loading && tripMetadata?.status === "new.route"
              ? destinationData && <RouteChat />
              : null}
          </View>
          <View
            style={{
              height: 84,
            }}
          ></View>
        </View>
      </BottomSheet>
    </>
  );
}
