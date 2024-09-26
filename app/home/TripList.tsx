import { Text, View } from "@/components/Themed";
import { padding } from "@/constants/values";
import { Image } from "expo-image";
import React from "react";
import {
  Dimensions,
  SectionList,
  useColorScheme,
  ViewToken,
} from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/Colors";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useRouter } from "expo-router";

function TripList() {
  const [isScrollTop, setIsScrollTop] = React.useState(true);

  return (
    <>
      <MaskedView
        style={{
          flex: 1,
          backgroundColor: "transparent",
          transform: [{ translateY: -10 }],
        }}
        maskElement={
          <View
            style={[
              {
                flex: 1,
                pointerEvents: "none",
              },
            ]}
          >
            <View
              style={{
                height: 10,
              }}
            />
            {/* <LinearGradient
            colors={["transparent", "black"]}
            locations={[0, 1]}
            style={{
              width: "100%",
              height: 100,
              pointerEvents: "none",
            }}
          /> */}
            <View
              style={{
                flex: 1,
                backgroundColor: "black",
              }}
            />
          </View>
        }
      >
        <SectionList
          onScroll={(e) => {
            console.log(e.nativeEvent.contentOffset.y);
            setIsScrollTop(e.nativeEvent.contentOffset.y <= 0);
          }}
          ListHeaderComponent={() => <View style={{}} />}
          ListHeaderComponentStyle={{
            height: 20,
            position: "absolute",
            top: 200,
            backgroundColor: "red",
          }}
          style={{
            flex: 1,
            // paddingHorizontal: padding,
            paddingTop: 0,
          }}
          sections={[
            {
              id: "last-opened-trip",
              title: "Last opened trip",
              data: ["item1"],
            },
            { id: "trips", title: "My trips", data: ["item3", "item4"] },
          ]}
          contentContainerStyle={{
            paddingTop: 0,
          }}
          renderItem={({ item, index, section }) => (
            <TripCard
              highlighted={section.title === "Last opened trip"}
              isScrollTop={isScrollTop}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 30 }} />}
          renderSectionHeader={({ section }) => (
            <SectionHeader
              current={isScrollTop}
              title={section.title}
            />
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      </MaskedView>
    </>
  );
}

export default React.memo(TripList);

function SectionHeader({
  current,
  title,
}: {
  current: boolean;
  title: string;
}) {
  const theme = useColorScheme();

  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  React.useEffect(() => {
    opacity.value = withTiming(current ? 0 : 1, {
      duration: 300,
    });
  }, [current]);

  return (
    <View
      style={{
        // backgroundColor: Colors.dark.background.primary,
        paddingHorizontal: padding,
      }}
    >
      {/* <MaskedView
        maskElement={
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
          </View>
        }
      ></MaskedView> */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: -20,
          },
          animatedStyle,
        ]}
      >
        <LinearGradient
          colors={[
            Colors[theme || "light"].background.primary,
            Colors[theme || "light"].background.primary,
            theme === "light" ? "rgba(255, 255, 255, 0)" : "rgba(0, 0, 0, 0)",
          ]}
          locations={[0, 0.1, 1]}
          style={{
            flex: 1,
            pointerEvents: "none",
          }}
        />
      </Animated.View>
      <Text
        fontStyle="subtitle"
        style={{
          marginBottom: 20,
          marginTop: 30,
        }}
      >
        {title}
      </Text>
    </View>
  );
}

const { width } = Dimensions.get("window");

function TripCard({
  highlighted,
  isScrollTop,
}: {
  highlighted?: boolean;
  isScrollTop: boolean;
}) {
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  React.useEffect(() => {
    opacity.value = withTiming(isScrollTop ? 1 : 0, {
      duration: 300,
    });
  }, [isScrollTop]);

  const router = useRouter();

  return (
    <View
      style={{
        paddingHorizontal: padding,
      }}
    >
      <TouchableOpacity
        style={{
          width: "100%",
          height: width - padding * 2,
          borderRadius: 30,
        }}
        onPress={() => {
          router.push("../trip/1");
        }}
      >
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          {highlighted && (
            <Animated.View
              style={[
                {
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 30,
                  opacity: 1,
                  transform: [{ scale: 1.35 }],
                },
                animatedStyle,
              ]}
            >
              <Image
                source={require("../../assets/images/blurred-california.png")}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 30,
                }}
              />
            </Animated.View>
          )}
          <Image
            source={require("../../assets/images/california.webp")}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 30,
            }}
          />
          <View
            style={{
              position: "absolute",
              top: "40%",
              left: 0,
              right: 0,
              bottom: 0,
              borderBottomLeftRadius: 29,
              borderBottomRightRadius: 29,
              overflow: "hidden",
            }}
          >
            <LinearGradient
              colors={["transparent", "black"]}
              locations={[0, 1]}
              style={{
                flex: 1,
                pointerEvents: "none",
              }}
            />
          </View>
        </View>
        <View
          style={{
            position: "absolute",
            bottom: 20,
            left: padding,
            right: padding,
            justifyContent: "flex-end",
            alignItems: "flex-start",
          }}
        >
          <Text
            fontStyle="title"
            style={{
              color: "white",
            }}
          >
            California road trip
          </Text>
          <Text
            fontStyle="caption"
            style={{
              color: "white",
            }}
          >
            {"23 > 28 July"}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
