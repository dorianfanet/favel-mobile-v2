import { Text, View } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { padding } from "@/constants/values";
import useTheme from "@/hooks/useTheme";
import React from "react";

interface HourGuideProps {
  hourHeight: number;
}

const HourGuide: React.FC<HourGuideProps> = ({ hourHeight }) => {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: padding,
        paddingLeft: 0,
      }}
    >
      {Array.from({ length: 25 }).map((_, index) => (
        <View
          key={index}
          style={{
            height: hourHeight,
            justifyContent: "flex-start",
            alignItems: "flex-start",
            flexDirection: "row",
          }}
        >
          <Text
            fontStyle="caption"
            style={{
              transform: [{ translateY: -10 }],
              textAlign: "right",
              width: 40,
            }}
          >
            {index === 0
              ? "12 AM"
              : index === 12
              ? "12 PM"
              : index > 12
              ? `${index - 12} ${index < 24 ? "PM" : "AM"}`
              : `${index} AM`}
          </Text>
          <View
            style={{
              height: 1,
              flex: 1,
              marginLeft: 10,
              backgroundColor: Colors[theme].text.primary,
              opacity: 0,
            }}
          />
        </View>
      ))}
    </View>
  );
};

export default HourGuide;
