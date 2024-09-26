import React from "react";
import { View, Text } from "react-native";

interface HourGuideProps {
  hourHeight: number;
}

const HourGuide: React.FC<HourGuideProps> = ({ hourHeight }) => {
  return (
    <View style={{ width: 50 }}>
      {Array.from({ length: 24 }).map((_, index) => (
        <View
          key={index}
          style={{
            height: hourHeight,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 12 }}>
            {index === 0
              ? "12 AM"
              : index === 12
              ? "12 PM"
              : index > 12
              ? `${index - 12} PM`
              : `${index} AM`}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default HourGuide;
