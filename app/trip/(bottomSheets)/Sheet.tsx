import { View, Text, Dimensions } from "react-native";
import React, { useCallback, useMemo } from "react";
import BottomSheet, { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { headerHeight } from "@/constants/values";
import { useBottomSheetRefs } from "@/context/bottomSheetsRefContext";

const { height } = Dimensions.get("window");

interface BackdropProps {
  position: Readonly<SharedValue<number>>;
}

interface SheetProps {
  sheetRef: React.RefObject<BottomSheet>;
  children: React.ReactNode;
  BackdropComponent: React.ComponentType<BackdropProps>;
  offsetHeight: number;
  initialIndex?: number;
  snapPoints: number[];
  animPosition?: SharedValue<number>;
  enablePanDownToClose?: boolean;
  onClose?: () => void;
}

function Sheet({
  initialIndex,
  sheetRef,
  BackdropComponent,
  children,
  offsetHeight,
  snapPoints,
  animPosition,
  enablePanDownToClose = false,
  onClose,
}: SheetProps) {
  const animatedPosition = useSharedValue(height - snapPoints[0]);

  const { masterPosition } = useBottomSheetRefs();

  const position = useDerivedValue(() => {
    const value = animatedPosition.value;
    const x = height - snapPoints[0];
    const y = height - snapPoints[1];

    if (x === y) {
      return 0;
    }

    if (value < Math.min(x, y) || value > Math.max(x, y)) {
      return 0;
    }

    function calculateProgress(): number {
      const totalRange = Math.abs(y - x);
      const progress = Math.abs(value - x);

      const percentage = (progress / totalRange) * 100;
      return Number(percentage.toFixed(2));
    }

    const progress = calculateProgress();

    const pos = progress / 100;

    animPosition && (animPosition.value = pos);

    masterPosition.value = pos;

    return pos;
  });

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      borderRadius: (1 - position.value) * 30,
    };
  });

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onClose && onClose();
    }
  }, []);

  return (
    <>
      <BackdropComponent position={position} />
      <BottomSheet
        ref={sheetRef}
        index={initialIndex ? initialIndex : -1}
        snapPoints={snapPoints}
        handleComponent={() => null}
        enablePanDownToClose={enablePanDownToClose}
        onChange={handleSheetChanges}
        style={[
          {
            borderRadius: 20,
            overflow: "hidden",
          },
          animatedContainerStyle,
        ]}
        animatedPosition={animatedPosition}
      >
        {children}
      </BottomSheet>
    </>
  );
}

export default Sheet;
