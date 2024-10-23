import { Dimensions } from "react-native";
import React, { useEffect, useMemo } from "react";
import BottomSheet from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TripDay, TripEvent } from "@/types/trip";
import CalendarSheet from "./(sheets)/CalendarSheet";
import { useBottomSheetRefs } from "@/context/bottomSheetsRefContext";
import { Text, View } from "@/components/Themed";
import PlaceSheet from "./(sheets)/PlaceSheet";
import { headerHeight } from "@/constants/values";
import TransportSheet from "./(sheets)/TransportSheet";
import DiscoverySheet from "./(sheets)/DiscoverySheet";

const { height } = Dimensions.get("window");

export default function BottomSheets({
  tripDays,
  tripEvents,
  loading,
}: {
  tripDays: TripDay[];
  tripEvents: TripEvent[];
  loading: boolean;
}) {
  const inset = useSafeAreaInsets();

  const offsetHeight = useMemo(() => {
    return height - inset.top - headerHeight;
  }, [inset]);

  const { sheetsRef, openSheet } = useBottomSheetRefs();

  useEffect(() => {
    if (!loading) {
      openSheet("calendar");
    }
  }, [loading]);

  return (
    <>
      <CalendarSheet
        sheetRef={sheetsRef.calendar}
        offsetHeight={offsetHeight}
        tripDays={tripDays}
        tripEvents={tripEvents}
      />
      <PlaceSheet
        sheetRef={sheetsRef.place}
        offsetHeight={offsetHeight}
      />
      <TransportSheet
        sheetRef={sheetsRef.transport}
        offsetHeight={offsetHeight}
      />
      <DiscoverySheet
        sheetRef={sheetsRef.discovery}
        offsetHeight={offsetHeight}
      />
    </>
  );
}
// import {
//   Dimensions,
// } from "react-native";
// import React, { useEffect, useMemo } from "react";
// import {
//   BottomSheetModal,
// } from "@gorhom/bottom-sheet";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { BackgroundView, View } from "@/components/Themed";
// import Animated, {
//   useAnimatedStyle,
//   useSharedValue,
// } from "react-native-reanimated";
// import Calendar from "@/components/Calendar";
// import { TripDay, TripEvent } from "@/types/trip";

// const { height } = Dimensions.get("window");

// const dates = {
//   startDate: new Date(2024, 8, 25),
//   endDate: new Date(2024, 8, 29),
// };

// export default function BottomSheets({
//   tripDays,
//   tripEvents,
//   loading,
// }: {
//   tripDays: TripDay[];
//   tripEvents: TripEvent[];
//   loading: boolean;
// }) {
//   const inset = useSafeAreaInsets();

//   const calendarModalRef = React.useRef<BottomSheetModal>(null);

//   useEffect(() => {
//     calendarModalRef.current?.present();
//   }, []);

//   const animatedPosition = useSharedValue(0);

// const offsetHeight = useMemo(() => {
//   return height - inset.top - 50;
// }, [inset]);

//   useEffect(() => {
//     if (!loading) {
//       calendarModalRef.current?.snapToIndex(0);
//     }
//   }, [loading]);

//   const animatedStyle = useAnimatedStyle(() => {
//     function calculateProgress(x: number, y: number, value: number): number {
//       if (x === y) {
//         return 0;
//       }

//       if (value < Math.min(x, y) || value > Math.max(x, y)) {
//         return 0;
//       }

//       const totalRange = Math.abs(y - x);
//       const progress = Math.abs(value - x);

//       const percentage = (progress / totalRange) * 100;
//       return Number(percentage.toFixed(2));
//     }

//     return {
//       opacity:
//         1 -
//         calculateProgress(inset.top + 50, 746, animatedPosition.value) / 100,
//     };
//   });

//   return (
//     <>
// <Animated.View
//   style={[
//     {
//       position: "absolute",
//       flex: 1,
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//       // pointerEvents: "none",
//       backgroundColor: "red",
//       pointerEvents: "none",
//     },
//     animatedStyle,
//   ]}
// >
//   <BackgroundView
//     style={{
//       flex: 1,
//     }}
//   />
// </Animated.View>
//       <BottomSheetModal
//         ref={calendarModalRef}
//         index={-1}
//         snapPoints={[150, offsetHeight]}
//         handleComponent={() => (
//           <View
//             style={{
//               width: "100%",
//               height: 0,
//             }}
//           ></View>
//         )}
//         enableDismissOnClose={false}
//         enablePanDownToClose={false}
//         backgroundStyle={{
//           borderRadius: 21,
//         }}
//         animatedPosition={animatedPosition}
//       >
// <View
//   style={{
//     flex: 1,
//     borderRadius: 19,
//     overflow: "hidden",
//   }}
// >
//   <BackgroundView
//     style={{
//       width: "100%",
//       height: height,
//       alignItems: "center",
//       pointerEvents: "box-none",
//       transform: [{ translateY: -(inset.top + 50) }],
//     }}
//   ></BackgroundView>
//   <View
//     style={{
//       position: "absolute",
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//     }}
//   >
//     <Calendar
//       startDate={dates.startDate}
//       endDate={dates.endDate}
//       days={tripDays}
//       events={tripEvents}
//       height={offsetHeight}
//     />
//   </View>
// </View>
//       </BottomSheetModal>
//     </>
//   );
// }
