import { BlurView } from "@/components/Themed";
import { padding } from "@/constants/values";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useCallback, useMemo, useRef } from "react";
import { View } from "react-native";
import ShareCTA from "./ShareCTA";

export default function ShareModal({
  bottomSheetModalRef,
}: {
  bottomSheetModalRef: React.RefObject<BottomSheetModal>;
}) {
  const snapPoints = useMemo(() => [400], []);

  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  return (
    <>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
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
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            enableTouchThrough={true}
            pressBehavior="close"
          />
        )}
        keyboardBlurBehavior="restore"
      >
        <BottomSheetView
          style={{
            padding: padding,
            paddingBottom: 50,
            gap: 30,
            justifyContent: "center",
            height: "100%",
          }}
        >
          <ShareCTA />
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
}
