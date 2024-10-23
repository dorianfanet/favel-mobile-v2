import React, { useCallback } from "react";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { BackgroundView, View } from "@/components/Themed";
import Sheet from "../Sheet";
import { Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Calendar from "@/components/Calendar";
import { TripDay, TripEvent } from "@/types/trip";
import { useBottomSheetRefs } from "@/context/bottomSheetsRefContext";
import { TransportSection } from "@/types/transport";
import { lineString } from "@turf/turf";
import Transport from "@/components/Transport";
import TransportHeader from "@/components/Transport/Header";
import { useTripNavigationActions } from "@/hooks/useTripNavigationActions";

const { height } = Dimensions.get("window");

type TransportSheetProps = {
  sheetRef: React.RefObject<BottomSheet>;
  offsetHeight: number;
};

function TransportSheet({ sheetRef, offsetHeight }: TransportSheetProps) {
  const inset = useSafeAreaInsets();

  const renderBackdrop = useCallback(
    (position: Readonly<SharedValue<number>>) => {
      const animatedStyle = useAnimatedStyle(() => {
        return {
          opacity: position.value,
        };
      });

      return (
        <Animated.View
          style={[
            {
              position: "absolute",
              flex: 1,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: "none",
              opacity: 0,
            },
            animatedStyle,
          ]}
        >
          <BackgroundView
            style={{
              flex: 1,
            }}
          />
        </Animated.View>
      );
    },
    []
  );

  const { canPop, pop } = useTripNavigationActions();

  return (
    <Sheet
      sheetRef={sheetRef}
      BackdropComponent={({ position }) => renderBackdrop(position)}
      offsetHeight={offsetHeight}
      initialIndex={-1}
      snapPoints={[height * 0.5, offsetHeight]}
      // enablePanDownToClose
      // onClose={() => {
      //   console.log("onClose transport");
      //   if (canPop) {
      //     pop();
      //   }
      // }}
    >
      <View
        style={{
          flex: 1,
          overflow: "hidden",
        }}
      >
        <BackgroundView
          style={{
            width: "100%",
            height: height,
            alignItems: "center",
            pointerEvents: "box-none",
            transform: [{ translateY: -(inset.top + 50) }],
          }}
        ></BackgroundView>
        <BottomSheetView
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <TransportHeader />
          <BottomSheetScrollView>
            <Transport route={route} />
          </BottomSheetScrollView>
        </BottomSheetView>
      </View>
    </Sheet>
  );
}

export default React.memo(TransportSheet);

const route: TransportSection[] = [
  {
    id: "R0-S0",
    duration: 165,
    length: 164,
    mode: "pedestrian",
    sectionIndex: 0,
    departureTime: new Date("2024-10-03T08:40:51-07:00"),
    arrivalTime: new Date("2024-10-03T08:43:36-07:00"),
    departure: {
      lat: 37.7724734,
      lng: -122.4375787,
    },

    arrival: {
      lat: 37.7719019,
      lng: -122.4393083,
    },

    polyline: lineString([
      [37.772512, -122.437295],
      [37.77221, -122.43723],
      [37.77219, -122.43735],
      [37.77205, -122.43847],
      [37.77203, -122.43865],
      [37.77202, -122.43876],
      [37.772, -122.4389],
      [37.771946, -122.439317],
    ]),
  },
  {
    id: "R0-S1",
    duration: 646,
    length: 2409,
    mode: "kickScooter",
    sectionIndex: 1,
    departureTime: new Date("2024-10-03T08:44:36-07:00"),
    arrivalTime: new Date("2024-10-03T08:53:22-07:00"),
    departure: {
      lat: 37.7719019,
      lng: -122.4393083,
    },
    arrival: {
      lat: 37.7693067,
      lng: -122.4652067,
    },
    polyline: lineString([
      [37.771946, -122.439317],
      [37.77178, -122.44059],
      [37.77176, -122.44077],
      [37.77158, -122.44219],
      [37.77136, -122.44382999999999],
      [37.7712, -122.44503999999999],
      [37.77114, -122.44554],
      [37.77102, -122.44645],
      [37.77092, -122.44711],
      [37.77084, -122.44776999999999],
      [37.77072, -122.44874999999999],
      [37.770509999999994, -122.45042999999998],
      [37.770309999999995, -122.45204999999999],
      [37.77009999999999, -122.45371999999999],
      [37.770059999999994, -122.45401999999999],
      [37.77007, -122.45405999999998],
      [37.77008, -122.45410999999999],
      [37.77008, -122.45425999999999],
      [37.77012, -122.45455],
      [37.770199999999996, -122.455],
      [37.77025999999999, -122.45514],
      [37.77033999999999, -122.45543],
      [37.77031999999999, -122.4555],
      [37.77031999999999, -122.45557],
      [37.770619999999994, -122.45563999999999],
      [37.770649999999996, -122.45566999999998],
      [37.77072, -122.45576999999999],
      [37.77075, -122.45599999999999],
      [37.77084, -122.45658999999999],
      [37.77087, -122.45670999999999],
      [37.77091, -122.45695999999998],
      [37.77096, -122.45726999999998],
      [37.771, -122.45757999999998],
      [37.77076, -122.45787999999997],
      [37.77069, -122.45795999999997],
      [37.77059, -122.45815999999998],
      [37.770559999999996, -122.45836999999997],
      [37.77054999999999, -122.45858999999997],
      [37.770619999999994, -122.45861999999997],
      [37.770689999999995, -122.45866999999997],
      [37.77072, -122.45875999999997],
      [37.770739999999996, -122.45911999999997],
      [37.770799999999994, -122.45924999999997],
      [37.770669999999996, -122.45937999999997],
      [37.770619999999994, -122.45942999999997],
      [37.770599999999995, -122.45949999999996],
      [37.770599999999995, -122.45962999999996],
      [37.770489999999995, -122.45980999999996],
      [37.77043, -122.46000999999997],
      [37.77041, -122.46012999999996],
      [37.770379999999996, -122.46029999999996],
      [37.77036, -122.46049999999997],
      [37.77034999999999, -122.46067999999997],
      [37.77034999999999, -122.46083999999996],
      [37.77036, -122.46132999999996],
      [37.77034999999999, -122.46140999999996],
      [37.77029999999999, -122.46175999999996],
      [37.77009999999999, -122.46255999999995],
      [37.770019999999995, -122.46290999999995],
      [37.769999999999996, -122.46298999999995],
      [37.76998999999999, -122.46304999999995],
      [37.76980999999999, -122.46378999999995],
      [37.76966999999999, -122.46438999999995],
      [37.76963999999999, -122.46453999999996],
      [37.76955999999999, -122.46472999999996],
      [37.76939999999999, -122.46500999999996],
      [37.76931999999999, -122.46511999999997],
      [37.76927799999999, -122.46516699999997],
    ]),
    color: "#FD5535",
  },
  {
    id: "R0-S2",
    duration: 100,
    length: 99,
    mode: "pedestrian",
    sectionIndex: 2,
    departureTime: new Date("2024-10-03T08:54:22-07:00"),
    arrivalTime: new Date("2024-10-03T08:56:02-07:00"),
    departure: {
      lat: 37.7693067,
      lng: -122.4652067,
    },
    arrival: {
      lat: 37.7698646,
      lng: -122.4660947,
    },
    polyline: lineString([
      [37.769278, -122.465167],
      [37.76932, -122.46512],
      [37.7694, -122.46500999999999],
      [37.76956, -122.46472999999999],
      [37.769639999999995, -122.46453999999999],
      [37.76967, -122.46438999999998],
      [37.76989, -122.46455999999998],
      [37.77007, -122.46476999999997],
      [37.77016, -122.46493999999997],
      [37.770309999999995, -122.46510999999997],
      [37.770379999999996, -122.46512999999997],
      [37.77054999999999, -122.46505999999998],
      [37.77063999999999, -122.46505999999998],
      [37.77062999999999, -122.46517999999998],
      [37.77062999999999, -122.46526999999998],
      [37.77064999999999, -122.46538999999997],
      [37.77062999999999, -122.46550999999997],
      [37.77064999999999, -122.46571999999996],
      [37.770639999999986, -122.46580999999996],
      [37.770609999999984, -122.46587999999996],
      [37.77052999999999, -122.46600999999995],
      [37.770299999999985, -122.46629999999996],
      [37.77017099999998, -122.46646799999996],
    ]),
  },
  // {
  //   id: "R0-S1",
  //   preActions: [
  //     {
  //       action: "setup",
  //       duration: 60,
  //     },
  //   ],
  //   postActions: [
  //     {
  //       action: "park",
  //       duration: 60,
  //     },
  //   ],
  //   travelSummary: {
  //     duration: 646,
  //     length: 2409,
  //   },
  //   departure: {
  //     time: "2024-10-03T08:44:36-07:00",
  //     place: {
  //       type: "place",
  //       location: {
  //         lat: 37.7719019,
  //         lng: -122.4393083,
  //       },
  //     },
  //   },
  //   arrival: {
  //     time: "2024-10-03T08:53:22-07:00",
  //     place: {
  //       type: "place",
  //       location: {
  //         lat: 37.7693067,
  //         lng: -122.4652067,
  //       },
  //     },
  //   },
  //   polyline:
  //     "BG0qthoCppjxpHrKxvCnBnLnL34C3NvmD_JzrC3DnfvH74BnGnpB_EnpBvHn9BjN_oDvMnlDjNroDvC3SUvCUjDArJwCjSgFjc4D3IgFjSnBrEArE4SrE8B7BsEnG8BrO0F7kB8BvHwCzPkDrTwCrT_O3SrE_EnGvM7BjNT3NsE7BsEjD8BzFoBvW4DjIjIjIjDjDnBrEAjI7GnL3DvMnBvH7BzKnBvMTnLA_JUzeT_EjD7VvM_xB_E7VnB_ET3DnLnuB3IvlB7BrJ_E7L_JvR_E7GzC9C",
  //   transport: {
  //     mode: "kickScooter",
  //   },
  //   agency: {
  //     id: "provider-null-san_francisco",
  //     name: "provider null san_francisco",
  //     website: "https://www.spin.pm",
  //   },
  // },
  // {
  //   id: "R0-S2",
  //   travelSummary: {
  //     duration: 100,
  //     length: 99,
  //   },
  //   departure: {
  //     time: "2024-10-03T08:54:22-07:00",
  //     place: {
  //       type: "place",
  //       location: {
  //         lat: 37.7693067,
  //         lng: -122.4652067,
  //       },
  //     },
  //   },
  //   arrival: {
  //     time: "2024-10-03T08:56:02-07:00",
  //     place: {
  //       type: "place",
  //       location: {
  //         lat: 37.7698646,
  //         lng: -122.4660947,
  //       },
  //     },
  //   },
  //   polyline:
  //     "BG8johoC941ypH0C-CgF8GgKwRgF8L8BsJ4NzKoLjN0FzKsJzKsEnB0KsE0FATvHAzFoBvHnBvHoBjNTzF7BrE_EjIrOjShIvK",
  //   transport: {
  //     mode: "pedestrian",
  //   },
  // },
];
