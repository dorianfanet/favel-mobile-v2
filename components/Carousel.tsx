import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
} from "react-native-reanimated";
import {
  GestureHandlerRootView,
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.8;
const CARD_MARGIN = (width - CARD_WIDTH) / 2;

interface CarouselProps {
  data: any[];
  renderItem: (item: any, index: number) => React.ReactElement;
}

const Carousel: React.FC<CarouselProps> = ({ data, renderItem }) => {
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const panGesture = Gesture.Pan().onUpdate((event) => {
    scrollX.value = event.translationX;
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(event) => {
          console.log(
            event.nativeEvent.contentOffset.x,
            width,
            event.nativeEvent.contentOffset.x / width
          );
          console.log(
            data[Math.round(event.nativeEvent.contentOffset.x / width)].id
          );
        }}
      >
        {data.map((item, index) => (
          <View
            key={item.id}
            style={styles.cardContainer}
          >
            <Animated.View style={styles.card}>
              {renderItem(item, index)}
            </Animated.View>
          </View>
        ))}
      </Animated.ScrollView>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardContainer: {
    width: width,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: CARD_WIDTH,
    marginHorizontal: CARD_MARGIN,
  },
});

export default Carousel;
