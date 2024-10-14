import React from "react";
import ImageWithFallback from "../ImageWithFallback";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "../Themed";
import { padding } from "@/constants/values";
import Icon from "../Icon";
import Colors from "@/constants/Colors";
import useTheme from "@/hooks/useTheme";
import { easeGradient } from "react-native-easing-gradient";

const { colors, locations } = easeGradient({
  colorStops: {
    1: {
      color: "transparent",
    },
    0.5: {
      color: "#0000005a",
    },
    0: {
      color: "#000000",
    },
  },
});

interface HeroProps {
  heroHeight: number;
}

export default function Hero({ heroHeight }: HeroProps) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        width: "100%",
        height: heroHeight,
      }}
    >
      <MaskedView
        style={{
          flex: 1,
        }}
        maskElement={
          <View
            style={{
              width: "100%",
              height: "100%",
            }}
          >
            <View
              style={{
                backgroundColor: "black",
                flex: 1,
              }}
            />
            <LinearGradient
              colors={colors}
              locations={locations}
              style={{
                width: "100%",
                height: 250,
                pointerEvents: "none",
              }}
            />
          </View>
        }
      >
        <ImageWithFallback
          source={{
            uri: "https://media.licdn.com/dms/image/v2/D5612AQH75h2BaIPFZw/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1711431116565?e=1733961600&v=beta&t=JLvRVbdGnt-YgLIZ9K8PySrqOOuRvmZm109ey9maABs",
          }}
          style={{
            width: "100%",
            height: "100%",
          }}
        />
      </MaskedView>
      <View
        style={{
          position: "absolute",
          bottom: 70,
          width: "100%",
          padding: padding,
        }}
      >
        {/* <Text fontStyle="title">Pacific Coast Highway</Text> */}
        <View
          style={{
            position: "absolute",
            bottom: padding,
            left: padding,
          }}
        >
          <Text
            fontStyle="bigTitle"
            style={{
              color: Colors[theme].text.primary,
            }}
          >
            Golden Gate Park
          </Text>
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              alignItems: "center",
              marginTop: 10,
            }}
          >
            <View
              style={{
                backgroundColor: "#52e472",
                borderRadius: 10,
                width: 30,
                height: 30,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Icon
                icon="natureIcon"
                size={18}
                color={"white"}
              />
            </View>
            <Text
              fontStyle="subtitle"
              style={{
                color: Colors[theme].text.primary,
              }}
            >
              Park
            </Text>
          </View>
        </View>
      </View>
      <View
        style={{
          position: "absolute",
          bottom: -40,
          width: "100%",
          paddingHorizontal: padding,
        }}
      >
        <Reviews />
      </View>
    </View>
  );
}

function Reviews() {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        height: 100,
        backgroundColor: Colors[theme].background.primary,
        borderRadius: 20,
        flexDirection: "row",
      }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text fontStyle="bigTitle">4.7</Text>
        <View
          style={{
            flexDirection: "row",
          }}
        >
          <Icon
            icon="starIcon"
            size={16}
            color={Colors[theme].accent}
            fill={Colors[theme].accent}
          />
          <Icon
            icon="starIcon"
            size={16}
            color={Colors[theme].accent}
            fill={Colors[theme].accent}
          />
          <Icon
            icon="starIcon"
            size={16}
            color={Colors[theme].accent}
            fill={Colors[theme].accent}
          />
          <Icon
            icon="starIcon"
            size={16}
            color={Colors[theme].accent}
            fill={Colors[theme].accent}
          />
          <Icon
            icon="starIcon"
            size={16}
            color={Colors[theme].accent}
            fill={Colors[theme].accent}
            style={{
              opacity: 0.5,
            }}
          />
        </View>
        <Text
          fontStyle="caption"
          style={{
            opacity: 0.6,
          }}
        >
          1,234 reviews
        </Text>
      </View>
      <View
        style={{
          flex: 2,
        }}
      >
        <View
          style={{
            position: "absolute",
            top: 20,
            left: 0,
            bottom: 20,
            width: 1,
            backgroundColor: Colors[theme].text.primary,
            opacity: 0.3,
          }}
        />
      </View>
    </View>
  );
}
