import React, { createContext, useContext, useRef, ReactNode } from "react";
import BottomSheet from "@gorhom/bottom-sheet";
import { SharedValue, useSharedValue } from "react-native-reanimated";

type SheetName = "calendar" | "place" | "transport"; // Add more sheet names as needed

type BottomSheetRefs = {
  [key in SheetName]: React.RefObject<BottomSheet>;
};

interface BottomSheetContextType {
  sheetsRef: BottomSheetRefs;
  masterPosition: SharedValue<number>;
  openSheet: (sheetName: SheetName) => void;
  closeSheet: (sheetName: SheetName) => void;
  collapseCurrentSheet: () => void;
}

const BottomSheetContext = createContext<BottomSheetContextType | undefined>(
  undefined
);

export const BottomSheetProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const currentSheet = useRef<SheetName>("calendar");

  const sheetsRef: BottomSheetRefs = {
    calendar: useRef<BottomSheet>(null),
    place: useRef<BottomSheet>(null),
    transport: useRef<BottomSheet>(null),
  };

  const openSheet = (sheetName: SheetName) => {
    closeAllSheets();
    sheetsRef[sheetName].current?.snapToIndex(0);
    currentSheet.current = sheetName;
  };

  const closeSheet = (sheetName: SheetName) => {
    sheetsRef[sheetName].current?.close();
    openSheet("calendar");
    currentSheet.current = "calendar";
  };

  const closeAllSheets = () => {
    Object.values(sheetsRef).forEach((sheet) => sheet.current?.close());
  };

  const collapseCurrentSheet = () => {
    sheetsRef[currentSheet.current].current?.snapToIndex(0);
  };

  const masterPosition = useSharedValue(0);

  return (
    <BottomSheetContext.Provider
      value={{
        sheetsRef,
        openSheet,
        closeSheet,
        masterPosition,
        collapseCurrentSheet,
      }}
    >
      {children}
    </BottomSheetContext.Provider>
  );
};

export const useBottomSheetRefs = (): BottomSheetContextType => {
  const context = useContext(BottomSheetContext);
  if (context === undefined) {
    throw new Error("useBottomSheet must be used within a BottomSheetProvider");
  }
  return context;
};
