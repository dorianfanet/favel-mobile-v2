import { TextInput } from "@/components/Themed";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  Dimensions,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  Extrapolate,
} from "react-native-reanimated";

const StickySectionList = () => {
  const list = [...Array(4).keys()].map((m) => m);

  const [scrollPosition, setScrollPosition] = useState(0);

  return (
    <ScrollView
      scrollEventThrottle={12}
      style={styles.scrollView}
      onScroll={(e) => {
        setScrollPosition(e.nativeEvent.contentOffset.y);
      }}
    >
      {/* <View style={styles.block} />
      <View style={styles.header}>
        <TextInput
          placeholder="Search"
          style={styles.search_input}
        />
      </View> */}
      {list.length !== 0 &&
        list.map((m) => {
          return (
            <Item
              key={m}
              title={`Item ${m}`}
              scrollPosition={scrollPosition}
            />
          );
        })}
    </ScrollView>
  );
};

const Item = ({ title, scrollPosition }) => {
  const [y, setY] = useState(0);

  const animatedText = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollPosition,
      [y, y + 300],
      [0, 300],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY }],
    };
  });

  return (
    <View
      style={styles.item}
      onLayout={(event) => {
        const { x, y, width, height } = event.nativeEvent.layout;
        setY(y);
      }}
    >
      <Animated.Text
        style={[styles.item_text, animatedText]}
        // onLayout={(event) => {
        //   const { x, y, width, height } = event.nativeEvent.layout;
        //   console.log("x", x);
        //   console.log("y", y);
        //   console.log("width", width);
        //   console.log("height", height);
        // }}
      >
        {title}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "white",
  },
  block: {
    height: 200,
    marginBottom: 10,
    backgroundColor: "tan",
  },
  header: {
    padding: 10,
    backgroundColor: "white",
  },
  search_input: {
    padding: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "lightgray",
    borderRadius: 50,
  },
  item: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 300,
    padding: 10,
    borderWidth: 1,
    margin: 10,
    borderRadius: 10,
    borderColor: "white",
    backgroundColor: "lavender",
  },
  item_text: {
    color: "black",
    fontSize: 15,
    textAlign: "center",
    position: "absolute",
    top: 10,
  },
});

export default StickySectionList;
