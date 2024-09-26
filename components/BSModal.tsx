import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { Text } from "./Themed";

export default function BSModal({
  children,
  modalRef,
}: {
  children: React.ReactNode;
  modalRef: React.RefObject<BottomSheetModal>;
}) {
  // ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // variables
  const snapPoints = useMemo(() => ["25%", "50%"], []);

  // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  useEffect(() => {
    handlePresentModalPress();
  }, []);

  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  // renders
  return (
    <BottomSheetModal
      ref={modalRef}
      index={1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
    >
      {children}
    </BottomSheetModal>
  );
}
