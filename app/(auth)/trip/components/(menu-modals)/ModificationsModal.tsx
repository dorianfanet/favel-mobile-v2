import { View, StatusBar } from "react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetView,
  TouchableOpacity,
} from "@gorhom/bottom-sheet";
import Colors from "@/constants/Colors";
import { TripMetadata } from "@/types/types";
import { useTrip } from "@/context/tripContext";
import { BlurView, Button, Text } from "@/components/Themed";
import ImageWithFallback from "@/components/ImageWithFallback";
import { borderRadius, padding } from "@/constants/values";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Travelers from "./Travelers";
import Icon from "@/components/Icon";
import UserActivityCount from "@/components/UserActivityCount";
import * as MailComposer from "expo-mail-composer";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { track } from "@amplitude/analytics-react-native";
import UserCard from "@/components/UserCard";
import { formatTimestamp } from "@/lib/utils";
import { supabaseClient } from "@/lib/supabaseClient";
import { useRouter } from "expo-router";
import Edits from "@/app/(auth)/conversation/Edits";
import { useAssistant } from "@/context/assistantContext";

export default function ModificationsModal({
  bottomSheetModalRef,
}: {
  bottomSheetModalRef: React.RefObject<BottomSheetModal>;
}) {
  const snapPoints = useMemo(() => [385, "80%"], []);

  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  const { assistant, popAssistant } = useAssistant();

  return (
    <>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        onDismiss={popAssistant}
        backgroundComponent={(props) => (
          <View
            style={{
              flex: 1,
              padding: 0,
              margin: 0,
            }}
            {...props}
          >
            <BlurView
              tint="light"
              style={{
                borderWidth: 1,
                borderColor: Colors.light.bottomSheetBorder,
                backgroundColor: Colors.light.blurBackground,
                borderRadius: 30,
                // backgroundColor: "#eef8feb4",
              }}
            />
          </View>
        )}
        handleIndicatorStyle={{
          backgroundColor: Colors.light.primary,
        }}
      >
        <BottomSheetScrollView
          style={{
            gap: 30,
          }}
        >
          {assistant &&
          assistant.state === "speaking" &&
          assistant.modifications ? (
            <Edits
              edits={assistant.modifications}
              theme="light"
            />
          ) : null}
        </BottomSheetScrollView>
      </BottomSheetModal>
    </>
  );
}
