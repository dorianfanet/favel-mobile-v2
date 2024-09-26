import React from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import Map from "./Map";
import { Button, Text, View } from "@/components/Themed";
import Header from "./Header";
import BSModal from "@/components/BSModal";
import BSModals from "./BSModals";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import BottomSheets from "./BottomSheets";
import Assistant from "./(header)/Assistant";

export default function Index() {
  const { id } = useLocalSearchParams();

  const modal1Ref = React.useRef<BottomSheetModal>(null);
  const modal2Ref = React.useRef<BottomSheetModal>(null);

  const [modalFull, setModalFull] = React.useState(false);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View
        style={{
          flex: 1,
        }}
      >
        <Map />
        <BottomSheets
          onChange={(i) => {
            setModalFull(i === 1);
          }}
        />
        <Header>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Assistant />
          </View>
        </Header>
        {/* <BSModals /> */}
        {/* <BSModal modalRef={modal1Ref}>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text>Modal 1</Text>
          </View>
        </BSModal>
        <BSModal modalRef={modal2Ref}>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text>Modal 2</Text>
          </View>
        </BSModal> */}
      </View>
    </>
  );
}
