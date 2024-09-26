import { View, Text, Dimensions } from "react-native";
import React, { useCallback, useEffect } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BackgroundView } from "@/components/Themed";
import { useSharedValue } from "react-native-reanimated";

const { height } = Dimensions.get("window");

export default function BottomSheets({
  onChange,
}: {
  onChange: (i: number) => void;
}) {
  const inset = useSafeAreaInsets();

  const calendarModalRef = React.useRef<BottomSheetModal>(null);

  useEffect(() => {
    calendarModalRef.current?.present();
  }, []);

  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
    if (index === 1) {
      onChange(index);
    } else {
      onChange(index);
    }
  }, []);

  const animatedPosition = useSharedValue(0);

  console.log(animatedPosition.value);

  return (
    <BottomSheetModal
      ref={calendarModalRef}
      index={0}
      snapPoints={["15%", height - inset.top - 120]}
      handleHeight={0}
      handleComponent={() => null}
      onChange={handleSheetChanges}
      onAnimate={handleSheetChanges}
      enableDismissOnClose={false}
      enablePanDownToClose={false}
      backgroundStyle={{
        borderRadius: 21,
      }}
      animatedPosition={animatedPosition}
    >
      <View
        style={{
          flex: 1,
          borderRadius: 20,
          overflow: "hidden",
        }}
      >
        <BackgroundView
          style={{
            width: "100%",
            height: height,
            alignItems: "center",
            pointerEvents: "box-none",
            transform: [{ translateY: -(inset.top + 120) }],
          }}
        ></BackgroundView>
      </View>
    </BottomSheetModal>
  );
}
