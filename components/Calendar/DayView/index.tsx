import React, { useEffect } from "react";
import { View, ScrollView, Dimensions, useColorScheme } from "react-native";
import HourGuide from "./HourGuide";
import EventItem from "./EventItem";
import { Text } from "@/components/Themed";
import { TripEvent } from "@/types/trip";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useFocusEffect } from "@react-navigation/native";
import Colors from "@/constants/Colors";
import { padding } from "@/constants/values";
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import Icon from "@/components/Icon";
import useTheme from "@/hooks/useTheme";
import { AnimatedScrollView } from "react-native-reanimated/lib/typescript/reanimated2/component/ScrollView";

interface DayViewProps {
  events: TripEvent[];
  dayDate: Date;
  calendarHeight: number;
}

const { height } = Dimensions.get("window");

const SCROLL_THRESHOLD = 50;
const SCROLL_SPEED = 5;

const DayView: React.FC<DayViewProps> = ({
  events,
  dayDate,
  calendarHeight,
}) => {
  const hourHeight = 150; // Height for each hour in the calendar

  const { theme } = useTheme();

  const offsetY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    offsetY.value = event.contentOffset.y;
  });

  const scrollViewRef = React.useRef<AnimatedScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 8 * hourHeight, animated: false });
  }, [dayDate]);

  return (
    <>
      <Animated.ScrollView
        ref={scrollViewRef}
        style={{ flex: 1, paddingVertical: 10 }}
        onScroll={scrollHandler}
      >
        <HourGuide hourHeight={hourHeight} />
        <View
          style={{
            flex: 1,
            position: "absolute",
            top: 0,
            left: 50,
            right: 0,
            bottom: 0,
          }}
        >
          {events.map((event, index) => (
            <EventItem
              key={`${event.id}-${index}`}
              event={event}
              hourHeight={hourHeight}
              dayDate={dayDate}
              offsetY={offsetY}
              calendarHeight={calendarHeight}
            />
          ))}
          <View
            style={{
              position: "absolute",
              top: 2550,
              height: 172.5,
              width: "100%",
              paddingVertical: 5,
              paddingRight: padding,
              opacity: 0.6,
            }}
          >
            <View
              style={{
                flex: 1,
                borderColor: Colors[theme].accent,
                borderWidth: 2,
                borderRadius: 20,
                borderStyle: "dashed",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
                gap: 10,
              }}
            >
              <Icon
                icon="plusIcon"
                size={18}
                strokeWidth={3}
                color={Colors[theme].accent}
              />
              <Text>Add an evening activity</Text>
            </View>
          </View>
          <View
            style={{
              position: "absolute",
              top: 2827.5,
              height: 172.5,
              width: "100%",
              paddingVertical: 5,
              paddingRight: padding,
              opacity: 0.6,
            }}
          >
            <View
              style={{
                flex: 1,
                borderColor: "#f37711",
                borderWidth: 2,
                borderRadius: 20,
                borderStyle: "dashed",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
                gap: 10,
              }}
            >
              <Icon
                icon="plusIcon"
                size={18}
                strokeWidth={3}
                color={"#f37711"}
              />
              <Text>Find a restaurant for diner</Text>
            </View>
          </View>
        </View>
      </Animated.ScrollView>
    </>
  );
};

export default DayView;
